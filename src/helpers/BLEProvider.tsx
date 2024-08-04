import React, { createContext, useContext, FC } from "react";

import {
    BleClient,
    BleDevice,
    textToDataView,
} from "@capacitor-community/bluetooth-le";

interface BLEContextType {
    discoverDevice: () => Promise<BleDevice | undefined>;
    connect: (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
        pingFrequency?: number,
    ) => Promise<boolean>;
    write: (deviceId: string, message: string) => Promise<void>;
}

interface BLEProviderProps {
    children: React.ReactNode;
}

const BLEContext = createContext<BLEContextType | null>(null);

export const useBLE = (): BLEContextType | null => useContext(BLEContext);

const BLEProvider: FC<BLEProviderProps> = ({ children }) => {
    BleClient.initialize();

    const discoverDevice = async (): Promise<BleDevice | undefined> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return;

        try {
            const device = await BleClient.requestDevice({
                services: [process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID],
            });
            return device;
        } catch (error) {
            console.error(error);
        }
    };

    const connect = async (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
        pingFrequency: number = 10000,
    ): Promise<boolean> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return false;

        try {
            let pingInterval;

            await BleClient.connect(deviceId, (deviceId) => {
                clearInterval(pingInterval);
                disconnectCallback(deviceId);
            });

            pingInterval = setInterval(() => {
                write(deviceId, "ping");
            }, pingFrequency);

            return true;
        } catch (error) {
            console.error("Failed to connect to device", error);
        }
        return false;
    };

    const write = async (deviceId: string, message: string): Promise<void> => {
        if (
            !process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID ||
            !process.env.NEXT_PUBLIC_BLE_FLOWER_CHARACTERISTIC_UUID
        )
            return;

        try {
            await BleClient.write(
                deviceId,
                process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID,
                process.env.NEXT_PUBLIC_BLE_FLOWER_CHARACTERISTIC_UUID,
                textToDataView(message),
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <BLEContext.Provider value={{ discoverDevice, connect, write }}>
            {children}
        </BLEContext.Provider>
    );
};

export default BLEProvider;
