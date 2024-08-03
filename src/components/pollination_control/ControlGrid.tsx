import React, { FC, useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { HexColorPicker } from "react-colorful";

import { useBLE } from "../../helpers/BLEProvider";
import { Flower, Control } from "../../helpers/interfaces";
import { createPollinationSequence, updateFlowers } from "../../helpers/util";
import ControlCard from "./ControlCard";
import { FlowerSelector } from "../common/FlowerSelector";

interface ControlCardProps {
    cards: Record<string, Flower>;
    setControlCards: (controlCards: Record<string, Flower>) => void;
    flowers: Record<string, Flower>;
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void;
}

const ControlGrid: FC<ControlCardProps> = (props) => {
    const bleContext = useBLE();

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

    const cardSelected = (cardId: number) => {
        const card = controlCards[cardId];
        setSelectedCard(cardId);
        sendFlowerCommand(card.command);

        // update flower cards
        for (const index in selectedFlowers) {
            const flower = selectedFlowers[index];
            flower.controlCardId = cardId;
            updateFlowers(flower, props.setFlowers);
        }
    };

    const sendFlowerCommand = (command: string) => {
        if (bleContext) {
            for (const index in selectedFlowers) {
                const flower = selectedFlowers[index];
                if (flower.connected) {
                    bleContext.write(
                        flower.id,
                        createPollinationSequence([command]),
                    );
                }
            }
        }
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            sendFlowerCommand(customColor);
        }, 100);

        return () => clearTimeout(debounceTimeout);
    }, [customColor]);

    useEffect(() => {
        const commonControlCards: Set<number | undefined> = new Set(
            selectedFlowers.map((f) => f.controlCardId),
        );
        let cardId: number | null;
        if (commonControlCards.size === 1) {
            // the selected flowers do have the same control card selected
            cardId = commonControlCards.values().next().value;
        } else {
            // the selected flowers don't have the same control card selected
            cardId = null;
        }
        setSelectedCard(cardId);
    }, [selectedFlowers]);

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
                            onClick={cardSelected}
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
