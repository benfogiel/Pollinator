import time
import json
import asyncio

import aioble
import bluetooth
from machine import Pin
from micropython import const

from .flower import Flower
from .util import get_logger, update_persistent_mem
from .constants import (
    NAME,
    NAMES,
    DATA_PINS,
    LED_LENGTHS,
    PEDAL_LENGTHS,
    REFRESH_RATE_MS,
    MSG_TERMINATOR,
    MESSAGE_TIMEOUT_MS,
    PERSISTENT_UPDATE_DELAY,
    BLE_SERVICE_UUID,
    BLE_CMD_CHAR_PREFIX,
    BLE_STATE_CHAR_PREFIX,
)


# Constants
_BLE_SERVICE_UUID = bluetooth.UUID(BLE_SERVICE_UUID)
_ADV_INTERVAL_MS = const(250_000)

logger = get_logger()

async def read_once(cmd_char, residual: str, timeout_ms=MESSAGE_TIMEOUT_MS) -> tuple[str, str]:
    def _parse_message(msg):
        if MSG_TERMINATOR in msg:
            return msg.split(MSG_TERMINATOR, 1)
        return "", msg
    
    # check if there's a full message in the residual
    message, residual = _parse_message(residual)
    if message:
        return message, residual
    
    # read from characteristic and return if there's a full message
    try:
        _conn, message_chunk = await cmd_char.written(timeout_ms)
        residual += message_chunk.decode()
        return _parse_message(residual)
    except asyncio.TimeoutError:
        return "", residual


async def notify_state(flower: Flower, state_char: aioble.Characteristic):
    while True:
        state = flower.get_current_state()
        if state:
            payload = (json.dumps(state) + MSG_TERMINATOR).encode()
            state_char.write(payload, send_update=True)
        await asyncio.sleep(1)


async def flower_server(name: str, state_char: aioble.Characteristic):
    logger.info(f"Starting {name} BLE server...")
    while True:
        try:
            async with await aioble.advertise(
                _ADV_INTERVAL_MS,
                name=name,
                services=[_BLE_SERVICE_UUID],
            ) as connection:
                logger.info(f"Connection from {connection.device}")
                await connection.disconnected()
        except asyncio.CancelledError:
            logger.info("BLE server cancelled")
        except Exception as e:
            logger.error("BLE server error: %s", e)
        finally:
            # Ensure the loop continues to the next iteration
            await asyncio.sleep_ms(1)


async def command_handler(flower: Flower, cmd_char: aioble.Characteristic):
    t_last_persistent_update = time.time()
    pending_persistent_update = False
    residual = ""
    while True:
        try:
            message, residual = await read_once(cmd_char, residual)
            if message:
                logger.debug("Received: %s", message)
                try:
                    action = json.loads(message)
                    flower.pollinate(action)
                    pending_persistent_update = True
                except ValueError as e:
                    logger.error(f"Failed to parse JSON: {e}")
            else:
                # Check if we need to flush pending persistent memory update
                t_now = time.time()
                if pending_persistent_update and (t_now - t_last_persistent_update) > PERSISTENT_UPDATE_DELAY:
                    update_persistent_mem(flower.get_current_state(), flower.persistent_mem_file)
                    pending_persistent_update = False
                    t_last_persistent_update = t_now
        except asyncio.CancelledError:
            logger.info("Command handler cancelled")
        except Exception as e:
            logger.error("Command handler error: %s", e)
        finally:
            # Ensure the loop continues to the next iteration
            await asyncio.sleep_ms(1)


async def main():
    ble_service = aioble.Service(_BLE_SERVICE_UUID)

    tasks = []
    flowers = []
    for i, (name, pin, led_length, pedal_length) in enumerate(zip(NAMES, DATA_PINS, LED_LENGTHS, PEDAL_LENGTHS)):
        data_pin = Pin(pin, Pin.OUT)
        flower = Flower(name, i, led_length, pedal_length, data_pin)
        flowers.append(flower)

        cmd_char_uuid = bluetooth.UUID(f"{BLE_CMD_CHAR_PREFIX}{i:05d}")
        state_char_uuid = bluetooth.UUID(f"{BLE_STATE_CHAR_PREFIX}{i:05d}")
        cmd_char = aioble.Characteristic(ble_service, cmd_char_uuid, write=True, capture=True)
        state_char = aioble.Characteristic(ble_service, state_char_uuid, read=True, notify=True)

        tasks.append(asyncio.create_task(command_handler(flower, cmd_char)))
        tasks.append(asyncio.create_task(notify_state(flower, state_char)))
        tasks.append(asyncio.create_task(flower.update_task()))

    tasks.append(asyncio.create_task(flower_server(NAME, state_char)))
    aioble.register_services(ble_service)
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
