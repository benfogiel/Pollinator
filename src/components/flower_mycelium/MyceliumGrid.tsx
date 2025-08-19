import React, { FC } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { BleDevice } from "@capacitor-community/bluetooth-le";

import { useBLE } from "../../helpers/BLEProvider";
import {
    Command,
    CommandTypes,
    Flower,
    isCommandType,
} from "../../helpers/interfaces";
import { updateFlowers, updateFlowerConnection } from "../../helpers/util";
import FlowerCard from "./FlowerCard";
import Button from "../common/Button";

interface MyceliumGridProps {
    flowers: Record<string, Flower>;
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void;
}

const MyceliumGrid: FC<MyceliumGridProps> = ({ flowers, setFlowers }) => {
    const BLEContext = useBLE();

    const discoverConnect = async () => {
        if (!BLEContext) return;
        const device = await BLEContext.discoverDevice();
        if (device) {
            connectBouquet(device);
        }
    };

    const connectBouquet = async (device: BleDevice) => {
        if (!BLEContext) return;

        const deviceConnected = await BLEContext.connect(
            device.deviceId,
            (deviceId) => updateFlowerConnection(deviceId, setFlowers, false),
            (deviceId) => updateFlowerConnection(deviceId, setFlowers, true),
        );
        const commandCharacteristics =
            await BLEContext.getCommandCharacteristics(device.deviceId);
        const stateCharacteristics = await BLEContext.getStateCharacteristics(
            device.deviceId,
        );

        for (const commandCharacteristic of commandCharacteristics) {
            const last5Digits = commandCharacteristic.slice(-5);
            const stateCharacteristic = stateCharacteristics.find((state) =>
                state.includes(last5Digits),
            );
            if (stateCharacteristic) {
                const flowerId = device.deviceId + "-" + last5Digits;
                const selectedCommands: Command[] = [];
                const flowerStateStr = await BLEContext.read(
                    device.deviceId,
                    stateCharacteristic,
                );
                let flowerState: Record<string, string | string[]> | null =
                    null;
                let flowerName = flowerId;
                if (flowerStateStr) {
                    try {
                        flowerState = JSON.parse(flowerStateStr);
                        flowerName = (flowerState?.n as string) || flowerId;
                        for (const command in flowerState) {
                            if (!isCommandType(command)) continue;
                            if (Array.isArray(flowerState[command])) {
                                for (const motion of flowerState[command]) {
                                    selectedCommands.push({
                                        type: command as CommandTypes,
                                        command: motion,
                                    });
                                }
                            } else {
                                selectedCommands.push({
                                    type: command as CommandTypes,
                                    command: flowerState[command] as string,
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Failed to parse flower state", error);
                    }
                }

                updateFlowers(
                    {
                        id: flowerId,
                        name: flowerName,
                        device: device,
                        cmd_char_uuid: commandCharacteristic,
                        state_char_uuid: stateCharacteristic,
                        description: "",
                        connected: deviceConnected,
                        selectedCommands: selectedCommands,
                    },
                    setFlowers,
                );
            } else {
                console.error(
                    `No state characteristic found for ${commandCharacteristic}`,
                );
            }
        }
    };

    const reconnectBouquets = async () => {
        if (!BLEContext) return;

        // get stored flower IDs
        const storedFlowerIds = localStorage.getItem("flowerIds");
        if (!storedFlowerIds) return;

        const flowerIds = storedFlowerIds.split(",");
        const devices = await BLEContext.getDevices(flowerIds);
        const connectionPromises = devices.map((device) =>
            connectBouquet(device),
        );
        await Promise.all(connectionPromises);
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button text="Connect New" onClick={discoverConnect} />
                <Button text="Reconnect" onClick={reconnectBouquets} />
            </div>
            <Grid
                columns={isMobile ? "2" : "3"}
                gap="5"
                rows="repeat(0, 200px)"
                width="auto"
            >
                {Object.keys(flowers).map((id) => {
                    return (
                        <FlowerCard
                            key={id}
                            id={id}
                            flowerParams={flowers[id]}
                        />
                    );
                })}
            </Grid>
        </>
    );
};

export default MyceliumGrid;
