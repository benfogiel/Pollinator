# Pollinator Application

Built to control the most amazing LED flowers you'll ever cast your eyes on.

## Development Documentation

### Using Capacitor

1. Build the Next.js app with `yarn build`
2. If you don't already hav the `ios/` directory, generate it with `ios/` directory with `npx cap add ios`.
3. If a new `ios/` directory was generated, we'll need add the NSBluetoothAlwaysUsageDescription to Info.plist, otherwise the app will crash when trying to use Bluetooth. In `./ios/App/App/Info.plist` add the following:

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

4. Sync the build with the iOS app with `npx cap sync`
5. Open the iOS app in Xcode with `npx cap open ios` and run the app in the simulator or connect your device and run the app on your device.

To use live reload, add the following to the `capacitor.config.ts` file:

```ts
{
  server: {
    url: "http://localhost:3000"
    cleartext: true,
  }
}
```