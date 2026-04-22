# Pollinator Application

Built to control the most amazing LED flowers you'll ever cast your eyes on.

The app is a Next.js web app wrapped in a [Capacitor](https://capacitorjs.com/) shell so it can run natively on iOS and communicate with the flower hardware over Bluetooth Low Energy.

## Prerequisites

You will need the following installed before you can build the app:

- **Node.js** 18 or newer — install via [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org/).
- **Yarn** (Classic) — `npm install -g yarn`.
- **Xcode** 15 or newer — install from the Mac App Store, then open it once to accept the license and install the command line tools (`xcode-select --install`).
- **CocoaPods** — `sudo gem install cocoapods` (or `brew install cocoapods`).
- An **Apple ID** signed into Xcode (Xcode → Settings → Accounts). A paid Apple Developer account is only required to distribute the app; a free Apple ID is enough to run it on your own device.

Bluetooth features do **not** work in the iOS Simulator — you must run the app on a physical iPhone or iPad to talk to the flowers.

## Clone and install

```bash
git clone https://github.com/benfogiel/Pollinator.git
cd Pollinator
yarn install
```

## Running the app in your browser

For UI development without the native layer:

```bash
yarn dev
```

This starts the Next.js dev server on `http://localhost:3000`.

## Building and running the iOS app

### 1. Build the web bundle and open Xcode

From the project root:

```bash
yarn run build:ios
```

This runs `next build`, syncs the built web assets into the iOS project (`npx cap sync ios`), and opens the Xcode workspace (`ios/App/App.xcworkspace`). Always open the `.xcworkspace` — not the `.xcodeproj` — so CocoaPods dependencies resolve correctly.

If you ever need to open Xcode separately without rebuilding:

```bash
npx cap open ios
```

### 2. Configure signing in Xcode

The first time you open the project on a new machine you need to set up code signing:

1. In the Xcode Project Navigator, select the **App** project at the top of the tree.
2. Select the **App** target, then the **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. Set **Team** to your personal Apple ID team (or your organization's team).
5. Change the **Bundle Identifier** to something unique to you (for example `com.yourname.pollinator`). The bundled identifier is already claimed and will fail provisioning under a different team.

### 3. Run on a physical device

1. Connect your iPhone or iPad via USB and unlock it.
2. Trust the computer on the device if prompted.
3. At the top of the Xcode window, pick your device from the run destination selector (next to the scheme name).
4. Press **Cmd+R** (or click the ▶ button) to build and install.
5. The first time you launch the app on the device, iOS will block it as coming from an untrusted developer. On the device go to **Settings → General → VPN & Device Management**, tap your developer profile, and choose **Trust**.
6. Launch the app from the home screen. Grant Bluetooth permission when prompted.

### 4. Iterating

Any time you change web code (anything under `src/`), re-run `yarn run build:ios` to rebuild the bundle and re-sync it into the iOS project, then rebuild in Xcode. Changes to the native iOS project itself (`ios/`) only require a rebuild in Xcode.

If Xcode complains about missing pods after pulling new dependencies:

```bash
cd ios/App && pod install
```

## App to Microcontroller Communication

The app communicates with the microcontroller via Bluetooth Low Energy (BLE).

Commands are semicolon terminated JSON strings consisting of the key-value pair: command type (the key) and a command (the value). Each command type is independent and can be used in combination with other command types.

### Color

Applies a color pattern to the LED strips.

CommandType: `co`

Commands:
  - hex color: `#FF0000`
  - gradient: `grad, #FF0000, #0000FF`
  - rainbow: `rainbow`
  - rainbow2: `rainbow2`

Example:

```python
{"co": "grad, #FF0000, #0000FF"};
```

### Motion

Applies to the motion of the LED strips.

CommandType: `mo`

Commands:
  - `swirl`
  - `extended_swirl`
  - `breathe`
  - `flash`
  - `radiate`

Example:

```python
{"mo": "swirl"};
```

### Brightness

Dictates the brightness of the LED strips.

CommandType: `br`

Command: float between `0-100`

Example:

```python
{"br": "50"};
```

### Speed

Dictates the speed of the motion.

CommandType: `sp`

Command: float between `0-100`

Example:

```python
{"sp": "50"};
```
