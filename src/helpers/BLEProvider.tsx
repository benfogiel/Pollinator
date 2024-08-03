import React, { createContext, useContext, FC } from "react";

import {
    BleClient,
    BleDevice,
    textToDataView,
} from "@capacitor-community/bluetooth-le";

interface BLEContextType {
    connect: (
        disconnectCallback: (deviceId: string) => void,
    ) => Promise<BleDevice | undefined>;
    write: (deviceId: string, message: string) => Promise<void>;
}

interface BLEProviderProps {
    children: React.ReactNode;
}

const BLEContext = createContext<BLEContextType | null>(null);

export const useBLE = (): BLEContextType | null => useContext(BLEContext);

const BLEProvider: FC<BLEProviderProps> = ({ children }) => {
    BleClient.initialize();

    const connect = async (
        disconnectCallback: (deviceId: string) => void,
    ): Promise<BleDevice | undefined> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return;

        try {
            const device = await BleClient.requestDevice({
                services: [process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID],
            });
            await BleClient.connect(device.deviceId, disconnectCallback);
            return device;
        } catch (error) {
            console.error(error);
        }
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
        <BLEContext.Provider value={{ connect, write }}>
            {children}
        </BLEContext.Provider>
    );
};

export default BLEProvider;
