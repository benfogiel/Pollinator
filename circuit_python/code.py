import time
import board
from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService
import json

from helpers import Flower, load_env_file

env = load_env_file('.env')

# Constants
NAME = env.get("NAME")
DATA_PIN = getattr(board, f"D{env.get('DATA_PIN')}")
NUM_LEDS = int(env.get("NUM_LEDS"))
PEDAL_LENGTH = int(env.get("PEDAL_LENGTH"))
REFRESH_RATE = float(env.get("REFRESH_RATE"))
MSG_TERMINATOR = env.get("MSG_TERMINATOR")

def pollinate(action):
    if "color" in action:
        state = action["color"]
        components = state.split(",")
        if len(components) > 1:
            if components[0] == "gradient":
                flower_led.set_gradient(components[1], components[2])
        elif state.startswith("#") and len(state) == 7:
            flower_led.set_color_all(state)
        elif state == "rainbow":
            flower_led.rainbow()
        else:
            print(f"unknown static state: {state}")

    if "motion" in action:
        flower_led.set_current_motion_state(action["motion"])

    if "rate" in action:
        flower_led.set_update_rate(action["rate"])

    if "speed" in action:
        flower_led.set_update_rate(1.0 / float(action["speed"]))

    if "brightness" in action:
        flower_led.set_max_brightness(float(action["brightness"]) / 100)

def update_flower(t_last):
    t_now = time.monotonic()
    if t_now - t_last > flower_led.update_rate:
        flower_led.update()
        return t_now
    return t_last

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
        
    print("Timeout reached. Unable to read message stream.")
    return ""


flower_led = Flower(NUM_LEDS, PEDAL_LENGTH, DATA_PIN)

# Initialize the BLE radio
ble = BLERadio()
ble.name = NAME
uart = UARTService()
advertisement = ProvideServicesAdvertisement(uart)
print("Uart: ", uart.uuid)

t_last = time.monotonic()
while True:
    try:
        ble.start_advertising(advertisement)
        print("BLE advertising started")
    except:
        # already advertising
        pass

    while ble.connected:
        message = read_msg_stream()
        if message:
            print("Received:", message)
            try:
                action = json.loads(message)
                pollinate(action)
            except ValueError as e:
                print(f"Failed to parse JSON: {e}")
        t_last = update_flower(t_last)
        time.sleep(REFRESH_RATE)

    # still update the flower
    t_last = update_flower(t_last)
    time.sleep(REFRESH_RATE)
