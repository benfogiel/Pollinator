import json
import microcontroller
import neopixel
import board

from .util import parse_hex_color, hsv_to_rgb, get_logger

logger = get_logger()

def update_board_cache(data: dict):
    json_str = json.dumps(data)
    encoded_data = json_str.encode('utf-8')
    
    if len(encoded_data) > len(microcontroller.nvm):
        raise ValueError("Data is too large to fit in NVM")
    
    microcontroller.nvm[0:len(encoded_data)] = encoded_data

def read_board_cache() -> dict:
    stored_data = microcontroller.nvm[:]
    null_byte_index = stored_data.find(b'\x00')
    if null_byte_index != -1:
        stored_data = stored_data[:null_byte_index]
    
    json_str = stored_data.decode('utf-8')
    
    return json.loads(json_str) if json_str else {}


class Flower:
    def __init__(self, num_leds: int, pedal_length: int, data_pin: board.DigitalInOut):
        self.num_leds = num_leds
        self.pedal_length = pedal_length
        self.data_pin = data_pin
        self.current_motion_states = []
        self.update_rate = 1.0  # in seconds
        self.leds = neopixel.NeoPixel(
            self.data_pin, num_leds, brightness=0.8, auto_write=False
        )

        self.MOTION_STATES = {
            "swirl": self.swirl,
            "breathe": self.breathe,
            "flash": self.flash,
        }

        self._max_brightness = 1.0
        self._increasing_breadth = True
        self._flash_counter = 0

        self._cache_file = "cache.json"
        self.load_cached_state()

    def load_cached_state(self):
        cached_state = read_board_cache()
        if cached_state:
            self.pollinate(cached_state)

    def update_cache(self, state):
        current_cache = read_board_cache()
            
        # Merge the dictionaries
        new_cache = current_cache.copy()
        new_cache.update(state)
        
        update_board_cache(new_cache)

    def update(self):
        for state in self.current_motion_states:
            self.MOTION_STATES[state]()
        self.leds.show()

    def pollinate(self, action):
        if "color" in action:
            state = action["color"]
            components = state.split(",")
            if len(components) > 1:
                if components[0] == "gradient":
                    self.set_gradient(components[1], components[2])
            elif state.startswith("#") and len(state) == 7:
                self.set_color_all(state)
            elif state == "rainbow":
                self.rainbow()
            else:
                logger.error(f"unknown static state: {state}")

        if "motion" in action:
            self.set_current_motion_states(action["motion"])

        if "rate" in action:
            self.set_update_rate(action["rate"])

        if "speed" in action:
            if float(action["speed"]) == 0:
                self.set_update_rate(0)
            else:
                self.set_update_rate(1.0 / float(action["speed"]))

        if "brightness" in action:
            self.set_max_brightness(float(action["brightness"]) / 100)

        self.update_cache(action)

    def set_update_rate(self, rate):
        self.update_rate = rate

    def set_current_motion_states(self, states: list[str]):
        self.leds.brightness = self._max_brightness
        for state in states:
            if state not in self.MOTION_STATES:
                raise ValueError(f"State does not exist: {state}")
        self.current_motion_states = states

    def set_max_brightness(self, brightness):
        self._max_brightness = brightness
        self.leds.brightness = brightness
        self.leds.show()

    def get_pedal_leds(self, pedal_index):
        return range(
            pedal_index * self.pedal_length,
            min((pedal_index + 1) * self.pedal_length, self.num_leds),
        )

    def set_pedal_leds(self, pedal_index, color):
        for i in self.get_pedal_leds(pedal_index):
            self.leds[i] = color
        self.leds.show()

    def set_color_all(self, hex_color):
        color = parse_hex_color(hex_color)
        self.leds.fill(color)
        self.leds.show()

    def set_gradient(self, hex_color1, hex_color2):
        color1 = parse_hex_color(hex_color1)
        color2 = parse_hex_color(hex_color2)
        for i in range(self.num_leds):
            ratio = i / self.num_leds
            color = tuple(
                int(color1[j] + ratio * (color2[j] - color1[j])) for j in range(3)
            )
            self.leds[i] = color
        self.leds.show()

    def rainbow(self):
        for i in range(self.num_leds):
            hue = i / self.num_leds
            rgb = hsv_to_rgb(hue, 1.0, 1.0)
            self.leds[i] = rgb
        self.leds.show()

    def swirl(self):
        temp = self.leds[-1]
        for i in range(self.num_leds - 1, 0, -1):
            self.leds[i] = self.leds[i - 1]
        self.leds[0] = temp

    def breathe(self):
        if self._increasing_breadth:
            self.leds.brightness += 0.01
            if self.leds.brightness >= self._max_brightness:
                self._increasing_breadth = False
        else:
            self.leds.brightness -= 0.01
            if self.leds.brightness <= 0.1:
                self._increasing_breadth = True

    def flash(self):
        if self._flash_counter % 2 == 0:
            self.leds.brightness = self._max_brightness
        else:
            self.leds.brightness = 0
        self._flash_counter += 1
