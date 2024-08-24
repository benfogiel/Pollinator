import time
import board
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService
import json

from helpers import Flower, load_env_file, get_logger

env = load_env_file("env.txt")

# Constants
NAME = env.get("NAME")
DATA_PIN = getattr(board, f"D{env.get('DATA_PIN')}")
NUM_LEDS = int(env.get("NUM_LEDS"))
PEDAL_LENGTH = int(env.get("PEDAL_LENGTH"))
REFRESH_RATE = float(env.get("REFRESH_RATE"))
MSG_TERMINATOR = env.get("MSG_TERMINATOR")
INACTIVE_LIFETIME = 120 # 2 minutes

logger = get_logger()


def read_msg_stream(timeout=1) -> str:
    # read messages from the UART stream until terminator "\n" is reached or timeout
    message = ""
    t_start = time.monotonic()
    while time.monotonic() - t_start < timeout:
        if uart.in_waiting:
            message += uart.read(uart.in_waiting).decode("utf-8")
            if MSG_TERMINATOR in message:
                return message.replace(MSG_TERMINATOR, "")
        elif message == "":
            return ""

    logger.error("Timeout reached. Unable to read message stream.")
    return ""


def update(t_last: float) -> float:
    t_now = time.monotonic()
    if t_now - t_last > flower.update_rate:
        flower.update()
        return t_now
    return t_last


flower = Flower(NUM_LEDS, PEDAL_LENGTH, DATA_PIN)

# Initialize the BLE radio
ble = BLERadio()
ble.name = NAME
uart = UARTService()
advertisement = ProvideServicesAdvertisement(uart)

t_last = time.monotonic()
t_last_msg = time.monotonic()
while True:
    ble.start_advertising(advertisement)
    logger.info("BLE advertising started")
    while not ble.connected:
        # still update the flower
        t_last = update(t_last)
        time.sleep(REFRESH_RATE)

    while ble.connected:
        message = read_msg_stream()
        if message:
            logger.debug("Received: %s", message)
            t_last_msg = time.monotonic()
            try:
                action = json.loads(message)
                flower.pollinate(action)
            except ValueError as e:
                logger.error(f"Failed to parse JSON: %s", e)
        else:
            if time.monotonic() - t_last_msg > INACTIVE_LIFETIME:
                logger.info("Inactive lifetime reached, restarting advertisement.")
                break # disconnect
        t_last = update(t_last)
        time.sleep(REFRESH_RATE)

    # If we got here, we lost the connection. Go up to the top and start
    # advertising again and waiting for a connection.
    ble.stop_advertising()
