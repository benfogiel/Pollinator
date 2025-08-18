import json
import os

from .constants import LOG_LEVEL, PERSISTENT_MEM_FILE


class Logger:
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50
    
    _level_names = {
        DEBUG: 'DEBUG',
        INFO: 'INFO', 
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        CRITICAL: 'CRITICAL'
    }
    
    def __init__(self, name, level=INFO):
        self.name = name
        self.level = level
    
    def setLevel(self, level):
        if isinstance(level, str):
            level = getattr(self, level.upper(), self.INFO)
        self.level = level
    
    def _log(self, level, msg, *args):
        if level >= self.level:
            level_name = self._level_names.get(level, 'UNKNOWN')
            if args:
                msg = msg % args
            print(f"[{level_name}] {self.name}: {msg}")
    
    def debug(self, msg, *args):
        self._log(self.DEBUG, msg, *args)
    
    def info(self, msg, *args):
        self._log(self.INFO, msg, *args)
    
    def warning(self, msg, *args):
        self._log(self.WARNING, msg, *args)
    
    def error(self, msg, *args):
        self._log(self.ERROR, msg, *args)
    
    def critical(self, msg, *args):
        self._log(self.CRITICAL, msg, *args)


def get_logger():
    logger = Logger("code")
    logger.setLevel(getattr(logger, LOG_LEVEL))
    return logger


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


def update_persistent_mem(data: dict, file_path: str = PERSISTENT_MEM_FILE):
    current_persistent_mem = read_persistent_mem()
    new_persistent_mem = current_persistent_mem.copy()
    new_persistent_mem.update(data)

    try:
        with open(file_path, 'w') as f:
            json.dump(new_persistent_mem, f)
    except OSError as e:
        print(f"Error writing persistent memory: {e}")


def read_persistent_mem(file_path: str = PERSISTENT_MEM_FILE) -> dict:
    try:
        with open(file_path, 'r') as f:
            persistent_mem = json.load(f)
        return persistent_mem
    except (OSError, ValueError):
        # File doesn't exist or is corrupted, return empty dict
        return {}


def clear_board_persistent_mem(file_path: str = PERSISTENT_MEM_FILE):
    try:
        os.remove(file_path)
    except OSError:
        # File doesn't exist, nothing to clear
        pass