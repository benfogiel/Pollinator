from machine import Pin
import asyncio
import time
import neopixel

from .util import (
    parse_hex_color,
    hsv_to_rgb,
    get_logger,
    read_persistent_mem,
)
from .constants import REFRESH_RATE_MS

logger = get_logger()


class FlowerLED(neopixel.NeoPixel):
    def __init__(self, pin, n, brightness=0.8, *args, **kwargs):
        super().__init__(pin, n, *args, **kwargs)
        self._brightness = brightness

    @property
    def brightness(self):
        return self._brightness
    
    @brightness.setter
    def brightness(self, brightness):
        original_colors = [self[i] for i, _ in enumerate(self)]
        self._brightness = max(0, min(brightness, 1))
        for i, _ in enumerate(self):
            self[i] = original_colors[i]

    def __getitem__(self, index):
        return tuple(int(v / self._brightness) for v in super().__getitem__(index))
    
    def __setitem__(self, index, value):
        super().__setitem__(index, tuple(int(v * self._brightness) for v in value))
        


class Flower:
    def __init__(self, name: str, id: int, num_leds: int, pedal_length: int, data_pin: Pin):
        self.name = name
        self.id = id
        self.num_leds = num_leds
        self.pedal_length = pedal_length
        self.data_pin = data_pin
        self.current_motion_states = []
        self._update_rate_ms = 1000
        self._t_last_update = time.ticks_ms()
        self.leds = self.init_leds()
        self.persistent_mem_file = f"persistent_mem_{self.id}.json"

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

        self._brightness_setpoint = 1.0
        self._increasing_breadth = True
        self._flash_counter = 0

        self.load_state_from_mem()

    async def update_task(self):
        while True:
            t_now = time.ticks_ms()
            if time.ticks_diff(t_now, self._t_last_update) >= self._update_rate_ms:
                for state in self.current_motion_states:
                    self.MOTION_STATES[state][0]()
                self.leds.write()
                self._t_last_update = t_now
            else:
                await asyncio.sleep_ms(REFRESH_RATE_MS)

    def init_leds(self, leds=None):
        len_leds = len(leds) if leds else self.num_leds

        self.leds = FlowerLED(self.data_pin, len_leds)

        if leds:
            # set colors from leds to self.leds
            for i in range(len(leds)):
                self.leds[i] = leds[i]

        return self.leds

    def load_state_from_mem(self):
        persistent_mem_state = read_persistent_mem(self.persistent_mem_file)
        if persistent_mem_state:
            self.pollinate(persistent_mem_state)

        logger.debug("Loaded persistent_mem state: %s", persistent_mem_state)

    def get_current_state(self):
        """Get the current state of the flower for persistent memory updates"""
        state = {"n": self.name, "id": self.id}
        if hasattr(self, '_current_color_state'):
            state['co'] = self._current_color_state
        if self.current_motion_states:
            state['mo'] = self.current_motion_states
        if self._update_rate_ms != 1000:
            state['sp'] = str(1000 / self._update_rate_ms if self._update_rate_ms > 0 else 0)
        if self._brightness_setpoint != 1.0:
            state['br'] = str(int(self._brightness_setpoint * 100))
        return state

    def pollinate(self, action):
        if "co" in action:
            state = action["co"]
            self._current_color_state = state
            
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

        if "sp" in action:
            if float(action["sp"]) == 0:
                self._update_rate_ms = 0
            else:
                self._update_rate_ms = 1.0 / float(action["sp"]) * 1000

        if "br" in action:
            self.set_brightness_setpoint(float(action["br"]) / 100)

        self.leds.write()

    def set_current_motion_states(self, states):
        self.leds.brightness = self._brightness_setpoint
        for state in states:
            if state not in self.MOTION_STATES:
                raise ValueError("State does not exist: %s" % state)
        self.current_motion_states = states
        self.invoke_mutators()

    # --- LED property methods --- #

    def set_brightness_setpoint(self, brightness):
        self._brightness_setpoint = brightness
        self.leds.brightness = brightness
        self.leds.write()

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
        # neopixel LED list doesn't like slicing
        leds = []
        for i in range(self.num_leds):
            leds.append(self.leds[i])
        self.init_leds(leds)

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

    def extend(self):
        # extend leds by a multiple of pedal length
        new_leds = []
        for i in range(self.num_leds * self.pedal_length):
            new_leds.append(self.leds[i // self.pedal_length])

        self.init_leds(new_leds)

    # --- color methods --- #

    def set_pedal_leds(self, pedal_index, color):
        for i in self.get_pedal_leds(pedal_index):
            self.leds[i] = color

    def set_color_all(self, hex_color):
        color = parse_hex_color(hex_color)
        self.leds.fill(color)

    def set_gradient(self, hex_color1, hex_color2):
        color1 = parse_hex_color(hex_color1)
        color2 = parse_hex_color(hex_color2)
        for i in range(self.num_leds):
            ratio = i / (self.num_leds / 2) if i < self.num_leds / 2 else 1 - (i - self.num_leds / 2) / (self.num_leds / 2)
            color = tuple(
                int(color1[j] + ratio * (color2[j] - color1[j])) for j in range(3)
            )
            self.leds[i] = color

    def rainbow(self):
        for i in range(self.num_leds):
            hue = (i+1) / self.num_leds
            rgb = hsv_to_rgb(hue, 1.0, 1.0)
            self.leds[i] = rgb

    def rainbow2(self):
        for i in range(self.num_leds):
            hue = (
                (i+1) / (self.num_leds / 2)
                if i < self.num_leds / 2
                else 1 - (i - self.num_leds / 2) / (self.num_leds / 2)
            )
            rgb = hsv_to_rgb(hue, 1.0, 1.0)
            self.leds[i] = rgb

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
            if self.leds.brightness >= self._brightness_setpoint:
                self._increasing_breadth = False
        else:
            self.leds.brightness -= 0.01
            if self.leds.brightness <= 0.1:
                self._increasing_breadth = True

    def flash(self):
        if self._flash_counter % 2 == 0:
            self.leds.brightness = self._brightness_setpoint
        else:
            self.leds.brightness = 0
        self._flash_counter += 1
