import React, { FC } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";

import { useBLE } from "../../helpers/BLEProvider";
import { Flower } from "../../helpers/interfaces";
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

    const connectToBLE = async () => {
        if (!BLEContext) return;

        const device = await BLEContext.discoverDevice();
        if (!device || !device.name) return;

        const flowerConnected = await BLEContext.connect(
            device.deviceId,
            (flowerId) => updateFlowerConnection(flowerId, setFlowers, false),
            (flowerId) => updateFlowerConnection(flowerId, setFlowers, true),
        );

        updateFlowers(
            {
                id: device.deviceId,
                name: device.name,
                device: device,
                description: "",
                connected: flowerConnected,
                selectedCommands: [],
            },
            setFlowers,
        );
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button text="Auto-Connect" onClick={connectToBLE} />
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
