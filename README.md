# Pollinator Application

Built to control the most amazing LED flowers you'll ever cast your eyes on.

## Developer Documentation

### App to Microcontroller Communication

The app communicates with the microcontroller via Bluetooth Low Energy (BLE).

Commands are semicolon terminated JSON strings consisting of the key-value pair: command type (the key) and a command (the value). Each command type is independent and can be used in combination with other command types.

#### Color:
Applies a color pattern to the LED strips.

CommandType: `co`

Commands:
  - hex color: `#FF0000`
  - gradient: `grad, #FF0000, #0000FF`
  - rainbow: `rainbow`
  - rainbow2: `rainbow2`

Example:

```json
{"co": "grad, #FF0000, #0000FF"};
```

#### Motion:
Applies to the motion of the LED strips.

CommandType: `mo`

Commands:
  - `swirl`
  - `extended_swirl`
  - `breathe`
  - `flash`
  - `radiate`

Example:

```json
{"mo": "swirl"};
```

#### Brightness:
Dictates the brightness of the LED strips.

CommandType: `br`

Command: float between `0-100`

Example:

```json
{"br": "50"};
```

#### Speed:
Dictates the speed of the motion.

CommandType: `sp`

Command: float between `0-100`

Example:

```json
{"sp": "50"};
```


### Building the iOS app

```
npm run build:ios
```

This will build the Next.js app and sync the build with the iOS app.

If building the ios/ directory from scratch, you'll need to add the `NSBluetoothAlwaysUsageDescription` to `Info.plist`, otherwise the app will crash when trying to use Bluetooth. In `./ios/App/App/Info.plist` add the following:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
  ...
+	<key>NSBluetoothAlwaysUsageDescription</key>
+	<string>Uses Bluetooth to connect and interact with peripheral BLE devices.</string>
+	<key>UIBackgroundModes</key>
+	<array>
+		<string>bluetooth-central</string>
+	</array>
</dict>
</plist>
```

To use live reload, add the following to the `capacitor.config.ts` file:

```ts
{
  server: {
    url: "http://localhost:3000"
    cleartext: true,
  }
}
```