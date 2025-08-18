#!/bin/bash

# flash the flower micropython code to the device with the latest code
# built to run on a Mac
# Usage: flash-flower.sh [-f|--firmware] [-l|--local [PATH]]

repo_path="/tmp/repo_$(date +%s)"
flash_firmware=false
use_local=false
chip=null

### Parse args ###
if [ $# -gt 0 ]; then
  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -h|--help)
        echo "Usage: $0 [-f|--firmware] [-l|--local [PATH]]"
        echo "  -l|--local [PATH] Use local repo instead of cloning; PATH optional (defaults to ./)"
        echo "  -f|--firmware     Flash the MicroPython firmware to the device (uses uv and esptool)"
        echo "  -c|--chip         Chip to flash. Options: esp32s3, esp32c3 (defaults to auto-detect)"
        exit 0
        ;;
      -l|--local)
        use_local=true
        if [ -n "${2:-}" ] && [[ ! "$2" =~ ^- ]]; then
          if [ -d "$2" ]; then
            repo_path="$2"
            shift
          else
            echo "Error: --local path '$2' does not exist or is not a directory."
            exit 1
          fi
        else
          repo_path="./"
        fi
        ;;
      -f|--firmware)
        flash_firmware=true
        ;;
      -c|--chip)
        if [ $# -lt 2 ] || [[ "$2" != "ESP32-S3" && "$2" != "ESP32-C3" ]]; then
          echo "Error: Invalid chip '$2'. Supported chips are: 'ESP32-S3', 'ESP32-C3'"
          exit 1
        fi
        chip="$2"
        shift
        ;;
      *)
        echo "Warning: Unrecognized argument '$1' (ignored)"
        ;;
    esac
    shift
  done
fi

### Functions ###

assert_success() {
  if [ $? -ne 0 ]; then
    echo "Error: $1"
    exit 1
  fi
}

check_dependencies() {
  # Check if uv is installed
  if ! command -v uv &>/dev/null 2>&1; then
      echo "uv is not installed. Do you want to install it? (y/n)"
      read -r answer
      if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
          echo "Installing uv..."
          curl -LsSf https://astral.sh/uv/install.sh | sh
          source ~/.bashrc
      else
          echo "uv is required to flash the firmware. Please install it."
          exit 1
      fi
  fi

  # check if ampy is installed
  if ! command -v ampy &>/dev/null 2>&1; then
      echo "ampy is not installed. installing it..."
      uv tool install adafruit-ampy || exit 1
  fi

}

check_dependencies

### Constants ###

CHIP_INFO="$(uvx esptool read-mac 2>&1)"
assert_success "Failed to read chip info. Try pressing the reset button or unplugging and re-plugging in the device."

if [ "$chip" = "null" ]; then
  CHIP_TYPE=$(echo "$CHIP_INFO" | awk -F': *' '/Chip type:/ {split($2,a," "); print a[1]; exit}')
else
  CHIP_TYPE="$chip"
fi
echo "Chip type: $CHIP_TYPE"

PORT=$(echo "$CHIP_INFO" | awk -F'on ' '/Connected to/ {sub(":","",$2); print $2; exit}')
echo "Using port: $PORT"

REPO_URL=https://github.com/benfogiel/Pollinator.git
CP_CODE_PATH="$repo_path/embedded/micropython"

if [ "$CHIP_TYPE" = "ESP32-S3" ]; then
  FIRMWARE_PATH="$repo_path/embedded/bin/MicroPython_ESP32_GENERIC_S3-20250809-v1.26.0.bin"
elif [ "$CHIP_TYPE" = "ESP32-C3" ]; then
  FIRMWARE_PATH="$repo_path/embedded/bin/MicroPython_ESP32_GENERIC_C3-20250415-v1.25.0.bin"
fi

###

if [ "$use_local" = false ]; then
  # Clone the repository to a temporary location
  git clone --depth 1 --branch master "$REPO_URL" "$repo_path"
  assert_success "Failed to clone repository"
fi

if [ "$flash_firmware" = true ]; then
  echo "Erasing flash..."
  uvx esptool erase-flash
  assert_success "Failed to erase flash. Ensure the board is in bootloader mode."

  echo "Flashing MicroPython firmware: $FIRMWARE_PATH"
  uvx esptool write-flash -z 0x0 "$FIRMWARE_PATH" || exit 1

  echo "Successfully flashed firmware."
  exit 0
fi

echo "Uploading files to board..."
echo "Uploading dependencies..."
ampy -p $PORT put "$CP_CODE_PATH/lib"
echo "Uploading source code..."
ampy -p $PORT put "$CP_CODE_PATH/src"
ampy -p $PORT put "$CP_CODE_PATH/boot.py"
assert_success "Failed to upload files to board. Try pressing the reset button or unplugging and re-plugging in the device."

# Edit constants.py variables
temp_dir=$(mktemp -d)
temp_file="$temp_dir/constants.py"
cp "$CP_CODE_PATH/src/constants.py" "$temp_file"
echo "Opening constants.py in your default editor..."
open -e "$temp_file"
echo "Please edit the constants and save the file."
echo "Press Enter when you are done editing and have closed the file..."
read -r
ampy -p "$PORT" put "$temp_file" src/constants.py || exit 1
rm -rf "$temp_dir"

echo "Board flashed successfully!"
