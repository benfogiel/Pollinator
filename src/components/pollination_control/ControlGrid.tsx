import React, { FC, useState } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";

import { useWebSocket } from "../../lib/provider/WebSocketProvider";
import { Flower, Control } from "../../lib/interfaces/interfaces";
import { updateFlower, createPollinationSequence } from "../../lib/util";
import ControlCard from "./ControlCard";
import { FlowerSelector } from "../common/FlowerSelector";

interface ControlCardProps {
    cards: Record<string, Flower>;
    setControlCards: (controlCards: Record<string, Flower>) => void;
    flowers: Record<string, Flower>;
    setFlowers: (flowers: Record<string, Flower>) => void;
}

const ControlGrid: FC<ControlCardProps> = (props) => {
    const websocketContext = useWebSocket();

    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);

    const controlCards: Control[] = [
        {
            id: "0",
            name: "White",
            description: "Pollinate with white light",
            command: "white",
        },
        {
            id: "1",
            name: "Red",
            description: "Pollinate with red light",
            command: "red",
        },
    ];

    const selectCard = (cardIndex: number) => {
        const card = controlCards[cardIndex];
        setSelectedCard(cardIndex);
        // updateFlower(props.flowers[id], props.flowers, props.setFlowers);
        if (websocketContext) {
            for (const index in selectedFlowers) {
                const flower = selectedFlowers[index];
                websocketContext.sendMessage(
                    flower.id,
                    createPollinationSequence([card.command]),
                );
            }
        }
    };

    return (
        <>
            <FlowerSelector
                flowers={Object.values(props.flowers)}
                selectedFlowers={selectedFlowers}
                setSelectedFlowers={setSelectedFlowers}
            />
            <Grid
                columns={isMobile ? "2" : "3"}
                gap="5"
                rows="repeat(0, 200px)"
                width="auto"
            >
                {controlCards.map((card, i) => {
                    return (
                        <ControlCard
                            key={i}
                            id={i}
                            label={card.name}
                            description={card.description}
                            selected={i === selectedCard}
                            onClick={selectCard}
                        />
                    );
                })}
            </Grid>
        </>
    );
};

export default ControlGrid;
