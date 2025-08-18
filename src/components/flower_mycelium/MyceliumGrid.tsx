import React, { FC } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { BleDevice } from "@capacitor-community/bluetooth-le";

import { useBLE } from "../../helpers/BLEProvider";
import { Command, CommandTypes, Flower } from "../../helpers/interfaces";
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
            connectFlower(device);
        }
    };

    const connectFlower = async (device: BleDevice) => {
        if (!BLEContext) return;

        const flowerConnected = await BLEContext.connect(
            device.deviceId,
            (flowerId) => updateFlowerConnection(flowerId, setFlowers, false),
            (flowerId) => updateFlowerConnection(flowerId, setFlowers, true),
        );

        const selectedCommands: Command[] = [];
        const flowerStateStr = await BLEContext.read(device.deviceId);
        let flowerState: Record<string, string> | null = null;
        if (flowerStateStr) {
            try {
                flowerState = JSON.parse(flowerStateStr);
            } catch (error) {
                console.error("Failed to parse flower state", error);
            }
        }
        if (flowerState) {
            for (const command in flowerState) {
                selectedCommands.push({
                    type: command as CommandTypes,
                    command: flowerState[command],
                });
            }
        }

        updateFlowers(
            {
                id: device.deviceId,
                name: device.name || "Unknown",
                device: device,
                description: "",
                connected: flowerConnected,
                selectedCommands: [],
            },
            setFlowers,
        );
    };

    const reconnectFlowers = async () => {
        if (!BLEContext) return;

        // get stored flower IDs
        const storedFlowerIds = localStorage.getItem("flowerIds");
        if (!storedFlowerIds) return;

        const flowerIds = storedFlowerIds.split(",");
        const devices = await BLEContext.getDevices(flowerIds);
        const connectionPromises = devices.map((device) =>
            connectFlower(device),
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
                <Button text="Reconnect" onClick={reconnectFlowers} />
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
