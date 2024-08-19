import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    FC,
} from "react";

import {
    BleClient,
    BleDevice,
    textToDataView,
} from "@capacitor-community/bluetooth-le";

import { splitIntoPackets } from "./util";

interface BLEContextType {
    discoverDevice: () => Promise<BleDevice | undefined>;
    getDevices: (deviceIds: string[]) => Promise<BleDevice[]>;
    connect: (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
        reconnectedCallback: (deviceId: string) => void,
        reconnectCount?: number,
    ) => Promise<boolean>;
    write: (deviceId: string, message: string) => Promise<void>;
    devices: Record<string, BleDevice>;
}

interface BLEProviderProps {
    children: React.ReactNode;
}

const BLEContext = createContext<BLEContextType | null>(null);

export const useBLE = (): BLEContextType | null => useContext(BLEContext);

const BLEProvider: FC<BLEProviderProps> = ({ children }) => {
    const [devices, setDevices] = useState<Record<string, BleDevice>>({});
    const [messageQueue, setMessageQueue] = useState<Array<[string, string[]]>>(
        [],
    );
    const [isSending, setIsSending] = useState<boolean>(false);

    useEffect(() => {
        const initBle = async () => {
            try {
                await BleClient.initialize();
            } catch (error) {
                console.error("Failed to initialize BLE", error);
            }
        };
        initBle();
    }, []);

    const discoverDevice = async (): Promise<BleDevice | undefined> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return;

        try {
            const device = await BleClient.requestDevice({
                services: [process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID],
            });
            setDevices((prevDevices) => ({
                ...prevDevices,
                [device.deviceId]: device,
            }));
            return device;
        } catch (error) {
            console.error(error);
        }
    };

    const getDevices = async (deviceIds: string[]): Promise<BleDevice[]> => {
        try {
            const devices = await BleClient.getDevices(deviceIds);
            setDevices((prevDevices) => ({
                ...prevDevices,
                ...devices.reduce((acc, device) => {
                    acc[device.deviceId] = device;
                    return acc;
                }, {}),
            }));
            return devices;
        } catch (error) {
            console.error("Failed to get devices", error);
        }
        return [];
    };

    const connect = async (
        deviceId: string,
        disconnectCallback: (deviceId: string) => void,
        reconnectedCallback: (deviceId: string) => void,
        reconnectCount: number = 0,
    ): Promise<boolean> => {
        if (!process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID) return false;

        try {
            await BleClient.disconnect(deviceId);
            await BleClient.connect(deviceId, async () => {
                disconnectCallback(deviceId);
                if (reconnectCount < 3) {
                    console.log(`Reconnecting ${deviceId}...`);
                    await connect(
                        deviceId,
                        disconnectCallback,
                        reconnectedCallback,
                        reconnectCount + 1,
                    );
                    reconnectedCallback(deviceId);
                } else {
                    console.log("Failed to reconnect");
                }
            });
            return true;
        } catch (error) {
            console.error("Failed to connect to device", error);
        }
        return false;
    };

    const write = async (deviceId: string, message: string): Promise<void> => {
        const packets: string[] = splitIntoPackets(
            message,
            process.env.NEXT_PUBLIC_MAX_BLE_PACKET_BYTES
                ? parseInt(process.env.NEXT_PUBLIC_MAX_BLE_PACKET_BYTES)
                : 20,
            process.env.NEXT_PUBLIC_BLE_MSG_TERMINATOR
                ? process.env.NEXT_PUBLIC_BLE_MSG_TERMINATOR
                : ";",
        );

        setMessageQueue((prevQueue) => [...prevQueue, [deviceId, packets]]);
    };

    useEffect(() => {
        const processQueue = async () => {
            if (
                isSending ||
                messageQueue.length === 0 ||
                !process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID ||
                !process.env.NEXT_PUBLIC_BLE_FLOWER_CHARACTERISTIC_UUID
            ) {
                return;
            }

            setIsSending(true);

            const [deviceId, packets] = messageQueue[0] ?? [
                undefined,
                undefined,
            ];

            if (deviceId && packets) {
                try {
                    for (const packet of packets) {
                        await BleClient.writeWithoutResponse(
                            deviceId,
                            process.env.NEXT_PUBLIC_BLE_FLOWER_SERVICE_UUID,
                            process.env
                                .NEXT_PUBLIC_BLE_FLOWER_CHARACTERISTIC_UUID,
                            textToDataView(packet),
                        );
                    }
                } catch (error) {
                    console.error("Failed to send packet", error);
                }
            }

            setIsSending(false);

            setMessageQueue((prevQueue) => prevQueue.slice(1));
        };

        processQueue();
    }, [messageQueue]);

    return (
        <BLEContext.Provider
            value={{ discoverDevice, getDevices, connect, write, devices }}
        >
            {children}
        </BLEContext.Provider>
    );
};

export default BLEProvider;
