#!/bin/bash

# flash the flower circuit python code to the device with the latest code

REPO_URL=https://github.com/benfogiel/Pollinator.git
SOURCE_DIR=embedded/circuit_python
TARGET_DIR=/Volumes/CIRCUITPY
TEMP_DIR="/tmp/repo_$(date +%s)"

# check that target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory does not exist ($TARGET_DIR). Connect the circuit python device to your computer."
  exit 1
fi

# Clone the repository to a temporary location
git clone --depth 1 --branch master "$REPO_URL" "$TEMP_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to clone repository"
  exit 1
fi

cd "$TEMP_DIR" || exit 1

# Ensure master branch is checked out
git checkout master
if [ $? -ne 0 ]; then
  echo "Error: Failed to checkout master branch"
  exit 1
fi

echo "Copying files to $TARGET_DIR..."
cp -r "$SOURCE_DIR"/. "$TARGET_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to copy files to $TARGET_DIR. Try unplugging and plugging in the device."
  exit 1
fi

cd ~ || exit 1
rm -rf "$TEMP_DIR"

echo "Files from $SOURCE_DIR copied to $TARGET_DIR successfully!"