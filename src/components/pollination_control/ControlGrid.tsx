import React, { FC, useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { HexColorPicker } from "react-colorful";

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
    const [customColor, setCustomColor] = useState<string>("#9F00FF");

    const controlCards: Control[] = [
        {
            id: "0",
            name: "Custom",
            description: "Pollinate with your light",
            command: customColor,
        },
        {
            id: "1",
            name: "White",
            description: "Pollinate with white light",
            command: "white",
        },
        {
            id: "2",
            name: "Red",
            description: "Pollinate with red light",
            command: "red",
        },
        {
            id: "3",
            name: "Rainbow Swirl",
            description: "Pollinate rainbow swirl magic",
            command: "rainbow_swirl",
        },
    ];

    const selectCard = (cardIndex: number) => {
        const card = controlCards[cardIndex];
        setSelectedCard(cardIndex);
        // updateFlower(props.flowers[id], props.flowers, props.setFlowers);
        setFlowerColor(card.command);
    };

    const setFlowerColor = (color: string) => {
        if (websocketContext) {
            for (const index in selectedFlowers) {
                const flower = selectedFlowers[index];
                websocketContext.sendMessage(
                    flower.id,
                    createPollinationSequence([color]),
                );
            }
        }
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setFlowerColor(customColor);
        }, 1000);

        return () => clearTimeout(debounceTimeout);
    }, [customColor]);

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
                {selectedCard === 0 && (
                    <HexColorPicker
                        color={customColor}
                        onChange={setCustomColor}
                        style={{
                            position: "absolute",
                            marginTop: "135px",
                        }}
                    />
                )}
            </Grid>
        </>
    );
};

export default ControlGrid;
