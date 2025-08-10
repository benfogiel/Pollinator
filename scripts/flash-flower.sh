#!/bin/bash

# flash the flower micropython code to the device with the latest code
# Usage: flash-flower.sh [--flash-cp] [-l|--local [PATH]]

REPO_URL=https://github.com/benfogiel/Pollinator.git
CP_CODE_DIR=embedded/micropython
FIRMWARE_PATH=embedded/bin/MicroPython_ESP32_GENERIC_C3-20250415-v1.25.0.bin

repo_dir="/tmp/repo_$(date +%s)"
flash_cp=false
use_local=false

# Parse args
if [ $# -gt 0 ]; then
  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -h|--help)
        echo "Usage: $0 [--flash-cp] [-l|--local [PATH]]"
        echo "  -l|--local [PATH] Use local repo instead of cloning; PATH optional (defaults to ./)"
        echo "  -c|--flash-cp     Flash the MicroPython firmware to the device (uses uv and esptool)"
        exit 0
        ;;
      -l|--local)
        use_local=true
        if [ -n "${2:-}" ] && [[ ! "$2" =~ ^- ]]; then
          if [ -d "$2" ]; then
            repo_dir="$2"
            shift
          else
            echo "Error: --local path '$2' does not exist or is not a directory."
            exit 1
          fi
        else
          repo_dir="./"
        fi
        ;;
      -c|--flash-cp)
        flash_cp=true
        ;;
      *)
        echo "Warning: Unrecognized argument '$1' (ignored)"
        ;;
    esac
    shift
  done
fi

# Check if uv is installed (required for esptool via uvx)
if ! command -v uv &>/dev/null 2>&1; then
    echo "uv is not installed. Do you want to install it? (y/n)"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo "Installing uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        source ~/.bashrc
    else
        echo "uv is required to flash the firmware. Please install it or re-run without --flash-cp."
        exit 1
    fi
fi

if [ "$use_local" = false ]; then
  # Clone the repository to a temporary location
  git clone --depth 1 --branch master "$REPO_URL" "$repo_dir"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to clone repository"
    exit 1
  fi
fi

if [ "$flash_cp" = true ]; then
  echo "Erasing flash..."
  uvx esptool erase-flash
  if [ $? -ne 0 ]; then
    echo "Error: Failed to erase flash"
    exit 1
  fi

  echo "Flashing MicroPython firmware: $repo_dir/$FIRMWARE_PATH"
  uvx esptool write-flash -z 0x0 "$repo_dir/$FIRMWARE_PATH"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to flash MicroPython firmware"
    exit 1
  fi

  echo "Done flashing MicroPython."
fi

# Edit constants.py variables
temp_dir=$(mktemp -d)
temp_file="$temp_dir/constants.py"
cp "$repo_dir/$CP_CODE_DIR/constants.py" "$temp_file"
uvx mpremote connect auto fs cp -r "$repo_dir/$CP_CODE_DIR"/* :
echo "Opening constants.py in your default editor..."
open -e "$temp_file"
echo "Please edit the constants and save the file."
echo "Press Enter when you are done editing and have closed the file..."
read -r

echo "Copying files to board..."
uvx mpremote connect auto fs cp -r "$repo_dir/$CP_CODE_DIR"/* :
if [ $? -ne 0 ]; then
  echo "Error: Failed to copy files to board. Try unplugging and plugging in the device."
  exit 1
fi
uvx mpremote connect auto fs cp "$temp_file" :constants.py
if [ $? -ne 0 ]; then
  echo "Error: Failed to copy modified constants.py to board."
  exit 1
fi

rm -rf "$temp_dir"
echo "Board flashed successfully!"