import React, { FC, useState } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";

import { useBLE } from "../../helpers/BLEProvider";
import { Flower } from "../../helpers/interfaces";
import { updateFlowers, flowerDisconnected } from "../../helpers/util";
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

    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const selectCard = (id: string) => {
        setSelectedCard(id);
    };

    const connectToBLE = async () => {
        if (!BLEContext) return;
        const device = await BLEContext.discoverDevice();
        if (
            !device ||
            !device.name ||
            !(await BLEContext.connect(device?.deviceId, (flowerId) =>
                flowerDisconnected(flowerId, setFlowers),
            ))
        )
            return;
        updateFlowers(
            {
                id: device.deviceId,
                name: device.name,
                description: "",
                connected: true,
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
                            selected={id === selectedCard}
                            onClick={selectCard}
                        />
                    );
                })}
            </Grid>
        </>
    );
};

export default MyceliumGrid;
