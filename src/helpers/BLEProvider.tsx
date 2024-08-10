import React, { createContext, useContext, FC } from "react";

import {
    BleClient,
    BleDevice,
    textToDataView,
} from "@capacitor-community/bluetooth-le";

import { splitIntoPackets } from "./util";

interface BLEContextType {
    discoverDevice: () => Promise<BleDevice | undefined>;
    connect: (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
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
                namePrefix: "Flower",
            });
            return device;
        } catch (error) {
            console.error(error);
        }
    };

    const connect = async (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
    ): Promise<boolean> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return false;

        try {
            await BleClient.connect(deviceId, disconnectCallback);

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
            const packets = splitIntoPackets(
                message,
                process.env.NEXT_PUBLIC_MAX_BLE_PACKET_BYTES
                    ? parseInt(process.env.NEXT_PUBLIC_MAX_BLE_PACKET_BYTES)
                    : 20,
                process.env.NEXT_PUBLIC_BLE_MSG_TERMINATOR
                    ? process.env.NEXT_PUBLIC_BLE_MSG_TERMINATOR
                    : ";",
            );

            for (const packet of packets) {
                await BleClient.write(
                    deviceId,
                    process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID,
                    process.env.NEXT_PUBLIC_BLE_FLOWER_CHARACTERISTIC_UUID,
                    textToDataView(packet),
                );
            }
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
