import React, { FC, useState } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { v4 as uuid } from "uuid";

import { useWebSocket } from "../../lib/provider/WebSocketProvider";
import { Flower } from "../../lib/interfaces/interfaces";
import { updateFlower } from "../../lib/util";
import FlowerCard from "./FlowerCard";
import NurseryModal from "./NurseryModal";
import Button from "../common/Button";
import { getFlowerAncestry } from "src/lib/service/flower_ancestry";

interface MyceliumGridProps {
    flowers: Record<string, Flower>;
    setFlowers: (flowers: Record<string, Flower>) => void;
}

const MyceliumGrid: FC<MyceliumGridProps> = ({ flowers, setFlowers }) => {
    const websocketContext = useWebSocket();

    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const selectCard = (id: string) => {
        setSelectedCard(id);
    };

    const reviveAncestors = async (): Promise<void> => {
        if (!websocketContext) return;
        const ancestors: Array<Flower> = getFlowerAncestry();
        await Promise.all(
            ancestors.map(async (flower: Flower) => {
                if (
                    Object.values(flowers).findIndex(
                        (f) => f.ip == flower.ip,
                    ) != -1
                ) {
                    console.debug(
                        `Skipping auto-connect for ${flower.ip} because it already exists in flowers`,
                    );
                    return;
                }
                try {
                    console.debug(`Attempting to auto-connect to ${flower.ip}`);
                    await websocketContext.addDevice({
                        id: flower.id,
                        ip: flower.ip,
                        port: flower.port,
                    });
                    updateFlower(flower, flowers, setFlowers);
                } catch (err) {
                    console.debug(`Failed to auto-connect to ${flower.ip}`);
                }
            }),
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
                <Button text="Auto-Connect" onClick={reviveAncestors} />
            </div>
            <Grid
                columns={isMobile ? "2" : "3"}
                gap="5"
                rows="repeat(0, 200px)"
                width="auto"
            >
                {Object.keys(flowers).map((id) => {
                    return (
                        <NurseryModal
                            key={id}
                            flowerCard={
                                <FlowerCard
                                    id={id}
                                    flowerParams={flowers[id]}
                                    selected={id === selectedCard}
                                    onClick={selectCard}
                                />
                            }
                            updateFlower={(flower) =>
                                updateFlower(flower, flowers, setFlowers)
                            }
                        />
                    );
                })}
                {
                    <NurseryModal
                        flowerCard={
                            <FlowerCard id={uuid()} onClick={selectCard} />
                        }
                        updateFlower={(flower) =>
                            updateFlower(flower, flowers, setFlowers)
                        }
                    />
                }
            </Grid>
        </>
    );
};

export default MyceliumGrid;
