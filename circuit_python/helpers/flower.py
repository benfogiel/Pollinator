import neopixel
import board

from .util import (
    parse_hex_color,
    hsv_to_rgb,
    get_logger,
    read_board_cache,
    update_board_cache,
)

logger = get_logger()


class Flower:
    def __init__(self, num_leds: int, pedal_length: int, data_pin: board.DigitalInOut):
        self.num_leds = num_leds
        self.pedal_length = pedal_length
        self.data_pin = data_pin
        self.current_motion_states = []
        self.update_rate = 1.0  # in seconds
        self.leds = self.init_leds()

        self.CUSTOM_COLOR_STATES = {
            "rainbow": self.rainbow,
            "rainbow2": self.rainbow2,
        }

        self.MOTION_STATES = {
            "swirl": (self.swirl,),
            "extended_swirl": (self.swirl, self.extend),
            "breathe": (self.breathe,),
            "flash": (self.flash,),
            "radiate": (self.radiate, self.mirror),
        }

        self._max_brightness = 1.0
        self._increasing_breadth = True
        self._flash_counter = 0

        self._cache_file = "cache.json"
        self.load_cached_state()

    def init_leds(self, leds = None):
        len_leds = len(leds) if leds else self.num_leds

        if hasattr(self, 'leds') and self.leds is not None:
            self.leds.deinit()

        self.leds = neopixel.NeoPixel(
            self.data_pin, len_leds, brightness=0.8, auto_write=False
        )

        if leds:
            # set colors from leds to self.leds
            for i in range(len(leds)):
                self.leds[i] = leds[i]

        return self.leds

    def load_cached_state(self):
        cached_state = read_board_cache()
        if cached_state:
            self.pollinate(cached_state)

        logger.debug(f"Loaded cached state: {cached_state}")

    def update_cache(self, state):
        current_cache = read_board_cache()

        # Merge the dictionaries
        new_cache = current_cache.copy()
        new_cache.update(state)

        update_board_cache(new_cache)

        logger.debug(f"Updated cache: {new_cache}")

    def update(self):
        for state in self.current_motion_states:
            self.MOTION_STATES[state][0]()
        self.leds.show()

    def pollinate(self, action):
        if "co" in action:
            state = action["co"]
            components = state.split(",")
            if len(components) > 1:
                if components[0] == "grad":
                    self.set_gradient(components[1], components[2])
            elif state.startswith("#") and len(state) == 7:
                self.set_color_all(state)
            elif state in self.CUSTOM_COLOR_STATES:
                self.CUSTOM_COLOR_STATES[state]()
            else:
                logger.error(f"unknown static state: {state}")
            self.invoke_mutators()
        if "mo" in action:
            self.set_current_motion_states(action["mo"])

        if "ur" in action:
            self.set_update_rate(action["ur"])

        if "sp" in action:
            if float(action["sp"]) == 0:
                self.set_update_rate(0)
            else:
                self.set_update_rate(1.0 / float(action["sp"]))

        if "br" in action:
            self.set_max_brightness(float(action["br"]) / 100)

        self.update_cache(action)

    def set_update_rate(self, rate):
        self.update_rate = rate

    def set_current_motion_states(self, states: list[str]):
        self.leds.brightness = self._max_brightness
        for state in states:
            if state not in self.MOTION_STATES:
                raise ValueError(f"State does not exist: {state}")
        self.current_motion_states = states
        self.invoke_mutators()

    # --- LED property methods --- #

    def set_max_brightness(self, brightness):
        self._max_brightness = brightness
        self.leds.brightness = brightness
        self.leds.show()

    def get_pedal_leds(self, pedal_index):
        return range(
            pedal_index * self.pedal_length,
            min((pedal_index + 1) * self.pedal_length, self.num_leds),
        )

    # --- mutators --- #

    def invoke_mutators(self):
        self.mutator_reset()
        for state in self.current_motion_states:
            if len(self.MOTION_STATES[state]) == 2:
                # invoke mutator function
                self.MOTION_STATES[state][1]()

    def mutator_reset(self):
        # reset led length to num_leds
        self.init_leds(self.leds[:self.num_leds])

    def mirror(self):
        # mirror the leds down the middle
        new_leds = []
        for i in range(0, self.num_leds, 2):
            new_leds.append(self.leds[i])

        # copy the first half to the second
        half = len(new_leds)
        for i in range(half):
            new_leds.append(new_leds[half - i - 1])

        self.init_leds(new_leds)
        self.leds.show()

    def extend(self):
        # extend leds by a multiple of pedal length
        new_leds = []
        for i in range(self.num_leds * self.pedal_length):
            new_leds.append(self.leds[i // self.pedal_length])

        self.init_leds(new_leds)
        self.leds.show()

    # --- color methods --- #

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
            ratio = i / (self.num_leds / 2) if i < self.num_leds / 2 else 1 - (i - self.num_leds / 2) / (self.num_leds / 2)
            color = tuple(
                int(color1[j] + ratio * (color2[j] - color1[j])) for j in range(3)
            )
            self.leds[i] = color
        self.leds.show()

    def rainbow(self):
        for i in range(self.num_leds):
            hue = (i+1) / self.num_leds
            rgb = hsv_to_rgb(hue, 1.0, 1.0)
            self.leds[i] = rgb
        self.leds.show()

    def rainbow2(self):
        for i in range(self.num_leds):
            hue = (
                (i+1) / (self.num_leds / 2)
                if i < self.num_leds / 2
                else 1 - (i - self.num_leds / 2) / (self.num_leds / 2)
            )
            rgb = hsv_to_rgb(hue, 1.0, 1.0)
            self.leds[i] = rgb
        self.leds.show()

    # -- motion methods --- #

    def swirl(self):
        temp = self.leds[0]
        for i in range(len(self.leds) - 1):
            self.leds[i] = self.leds[i + 1]
        self.leds[-1] = temp

    def radiate(self):
        # iterate the LED positions, one iteration loop on the first half of the LEDs
        # and the other iteration loop on the second half of the LEDs
        len_leds = len(self.leds)
        # first half of the LEDs
        temp = self.leds[0]
        for i in range(len_leds // 2 - 1):
            self.leds[i] = self.leds[i + 1]
        self.leds[len_leds // 2 - 1] = temp

        # second half of the LEDs
        temp2 = self.leds[len_leds - 1]
        for i in range(len_leds - 1, len_leds // 2 - 1, -1):
            self.leds[i] = self.leds[i - 1]
        self.leds[len_leds // 2] = temp2

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
