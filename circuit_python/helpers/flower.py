import neopixel
from .util import parse_hex_color, hsv_to_rgb


class Flower:

    def __init__(self, num_leds, pedal_length, data_pin):
        self.num_leds = num_leds
        self.pedal_length = pedal_length
        self.data_pin = data_pin
        self.current_motion_state = "idle"
        self.update_rate = 1.0  # in seconds
        self.leds = neopixel.NeoPixel(self.data_pin, num_leds, brightness=0.8, auto_write=False)

        self.MOTION_STATES = {
            "idle": lambda: None,
            "swirl": self.swirl,
            "breathe": self.breathe,
            "flash": self.flash,
        }

        self._max_brightness = 1.0
        self._increasing_breadth = True
        self._flash_counter = 0

    def set_current_motion_state(self, state):
        if state not in self.MOTION_STATES:
            raise ValueError(f"State does not exist: {state}")
        self.current_motion_state = state

    def set_max_brightness(self, brightness):
        self._max_brightness = brightness
        self.leds.brightness = brightness
        self.leds.show()
    
    def set_update_rate(self, rate):
        self.update_rate = rate

    def update(self):
        if self.current_motion_state in self.MOTION_STATES:
            self.MOTION_STATES[self.current_motion_state]()
    
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
        self.leds.show()

    def breathe(self):
        if self._increasing_breadth:
            self.leds.brightness += 0.05
            if self.leds.brightness >= self._max_brightness:
                self._increasing_breadth = False
        else:
            self.leds.brightness -= 0.05
            if self.leds.brightness <= 0.1:
                self._increasing_breadth = True
        self.leds.show()

    def flash(self):
        if self._flash_counter % 2 == 0:
            self.leds.fill((255, 255, 255))
        else:
            self.leds.fill((0, 0, 0))
        self.leds.show()
        self._flash_counter += 1
