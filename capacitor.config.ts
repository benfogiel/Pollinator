import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "pollinator.app",
    appName: "pollinator",
    webDir: "dist",
    plugins: {
        BluetoothLe: {
            displayStrings: {
                scanning: "Scanning...",
                cancel: "Cancel",
                availableDevices: "Available devices",
                noDeviceFound: "No device found",
            },
        },
    },
};

export default config;
