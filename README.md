# Pollinator Application

Built to control the most amazing LED flowers you'll ever cast your eyes on.

## Development Documentation

### Using Capacitor

1. Build the Next.js app with `yarn build`
2. If you don't already hav the `ios/` directory, generate it with `ios/` directory with `npx cap add ios`.
3. Sync the build with the iOS app with `npx cap sync`
4. Open the iOS app in Xcode with `npx cap open ios` and run the app in the simulator or connect your device and run the app on your device.

To use live reload, add the following to the `capacitor.config.ts` file:

```ts
{
  server: {
    url: "http://localhost:3000"
    cleartext: true,
  }
}
```