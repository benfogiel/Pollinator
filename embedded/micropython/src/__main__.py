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
    DATA_PIN,
    NUM_LEDS,
    PEDAL_LENGTH,
    REFRESH_RATE_MS,
    MSG_TERMINATOR,
    MESSAGE_TIMEOUT_MS,
    PERSISTENT_UPDATE_DELAY,
    BLE_SERVICE_UUID,
    BLE_FLOWER_COMMAND_UUID,
    BLE_FLOWER_STATE_UUID,
)


# Constants
_BLE_SERVICE_UUID = bluetooth.UUID(BLE_SERVICE_UUID)
_BLE_FLOWER_COMMAND_UUID = bluetooth.UUID(BLE_FLOWER_COMMAND_UUID)
_BLE_FLOWER_STATE_UUID = bluetooth.UUID(BLE_FLOWER_STATE_UUID)
_ADV_INTERVAL_MS = const(250_000)

logger = get_logger()
data_pin = Pin(DATA_PIN, Pin.OUT)
flower = Flower(NUM_LEDS, PEDAL_LENGTH, data_pin)

# Register GATT server, the service and characteristics
ble_service = aioble.Service(_BLE_SERVICE_UUID)
command_characteristic = aioble.Characteristic(ble_service, _BLE_FLOWER_COMMAND_UUID, write=True, capture=True)
state_characteristic = aioble.Characteristic(ble_service, _BLE_FLOWER_STATE_UUID, read=True, notify=True)

# Register service(s)
aioble.register_services(ble_service)


async def read_msg_stream(timeout_ms=MESSAGE_TIMEOUT_MS) -> str:
    # read messages from the UART stream until terminator is reached or timeout
    global command_characteristic
    message = ""
    t_start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), t_start) < timeout_ms:
        _conn, message_chunk = await command_characteristic.written()
        if message_chunk:
            message += message_chunk.decode()
            if MSG_TERMINATOR in message:
                return message.replace(MSG_TERMINATOR, "")
        else:
            await asyncio.sleep_ms(1)

    if message:
        logger.error("Timeout reached. Unable to read message stream.")
    return ""


def send_current_state(state: dict):
    global state_characteristic
    payload = (json.dumps(state) + MSG_TERMINATOR).encode()
    state_characteristic.write(payload, send_update=True)


async def flower_server():
    logger.info("Starting Flower BLE server...")
    while True:
        try:
            async with await aioble.advertise(
                _ADV_INTERVAL_MS,
                name=NAME,
                services=[_BLE_SERVICE_UUID],
            ) as connection:
                logger.info(f"Connection from {connection.device}")
                send_current_state(flower.get_current_state())
                await connection.disconnected()
        except asyncio.CancelledError:
            logger.info("BLE server cancelled")
        except Exception as e:
            logger.error("BLE server error: %s", e)
        finally:
            # Ensure the loop continues to the next iteration
            await asyncio.sleep_ms(1)


async def command_handler():
    t_last_persistent_update = time.time()
    pending_persistent_update = False
    while True:
        try:
            message = await read_msg_stream()
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
                    update_persistent_mem(flower.get_current_state())
                    pending_persistent_update = False
                    t_last_persistent_update = t_now
            await asyncio.sleep_ms(REFRESH_RATE_MS)
        except asyncio.CancelledError:
            logger.info("Command handler cancelled")
        except Exception as e:
            logger.error("Command handler error: %s", e)
        finally:
            # Ensure the loop continues to the next iteration
            await asyncio.sleep_ms(1)


async def main():
    flower_server_task = asyncio.create_task(flower_server())
    command_handler_task = asyncio.create_task(command_handler())
    _flower_updater_task = asyncio.create_task(flower.update_task())
    await asyncio.gather(flower_server_task, command_handler_task)


if __name__ == "__main__":
    asyncio.run(main())
