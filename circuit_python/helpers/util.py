import json
import adafruit_logging as logging
import microcontroller

def load_env_file(filepath) -> dict:
    env_vars = {}
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip().replace(" ", "")
            if line and not line.startswith("#"):
                key, value = line.split("=", 1)
                env_vars[key] = value
    return env_vars


def parse_hex_color(hex_color):
    hex_color = hex_color.strip()
    if hex_color.startswith("#"):
        hex_color = hex_color[1:]
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def hsv_to_rgb(h, s, v):
    if s == 0.0:
        return v, v, v
    i = int(h * 6.0)  # Assume hue wraps around 1
    f = (h * 6.0) - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i = i % 6
    if i == 0:
        return int(v * 255), int(t * 255), int(p * 255)
    if i == 1:
        return int(q * 255), int(v * 255), int(p * 255)
    if i == 2:
        return int(p * 255), int(v * 255), int(t * 255)
    if i == 3:
        return int(p * 255), int(q * 255), int(v * 255)
    if i == 4:
        return int(t * 255), int(p * 255), int(v * 255)
    if i == 5:
        return int(v * 255), int(p * 255), int(q * 255)


def get_logger():
    env = load_env_file("env.txt")

    logger = logging.getLogger("code")
    logger.setLevel(getattr(logging, env.get("LOG_LEVEL")))
    return logger


def update_board_cache(data: dict):
    json_str = json.dumps(data)
    encoded_data = json_str.encode("utf-8")

    if len(encoded_data) > len(microcontroller.nvm):
        raise ValueError("Data is too large to fit in NVM")

    microcontroller.nvm[0 : len(encoded_data)] = encoded_data


def read_board_cache() -> dict:
    stored_data = microcontroller.nvm[:]
    null_byte_index = stored_data.find(b"\x00")
    if null_byte_index != -1:
        stored_data = stored_data[:null_byte_index]

    json_str = stored_data.decode("utf-8")

    try:
        cache = json.loads(json_str)
    except ValueError:
        # nvm storage is corrupted clear it
        microcontroller.nvm[0:] = b"\x00" * len(microcontroller.nvm)
        return {}

    return cache
