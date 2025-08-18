# Embedded Code Documentation

## MicroPython

### Installing Dependencies

The dependencies are already installed to the `micropython/lib/` directory. However, if you need to install new dependencies or update existing ones use `uvx mpremote connect auto mip install <package>`. For example: to install the `aioble` package, run `uvx mpremote connect auto mip install aioble`.

### Flashing the Firmware and Code

To flash the firmware, run `./scripts/flash-flower.sh -f`. This will flash the firmware to the device and pull from github to flash the latest code and dependencies.

To flash only the code and dependencies, run `./scripts/flash-flower.sh`.

To flash code from a local directory, run `./scripts/flash-flower.sh -l <path>`.