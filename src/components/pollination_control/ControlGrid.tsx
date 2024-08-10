import React, { FC, useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { HexColorPicker } from "react-colorful";

import { useBLE } from "../../helpers/BLEProvider";
import {
    Flower,
    CommandTypes,
    Command,
    CommandCardId,
} from "../../helpers/interfaces";
import { updateFlowers } from "../../helpers/util";
import ControlCard from "./ControlCard";
import { FlowerSelector } from "../common/FlowerSelector";
import SectionSeparator from "../common/Separator";

interface ControlGridProps {
    cards: Record<string, Flower>;
    setControlCards: (controlCards: Record<string, Flower>) => void;
    flowers: Record<string, Flower>;
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void;
}

const ControlGrid: FC<ControlGridProps> = (props) => {
    const bleContext = useBLE();

    const [selectedColorCard, setSelectedColorCard] = useState<string | null>(
        null,
    );
    const [selectedMotionCard, setSelectedMotionCard] = useState<string | null>(
        null,
    );
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);
    const [customColor, setCustomColor] = useState<string>("#9F00FF");
    const [colorPickerVisible, setColorPickerVisible] =
        useState<boolean>(false);

    const colorCards: Command[] = [
        {
            type: CommandTypes.Color,
            name: "Custom",
            description: "Pollinate with your light",
            command: customColor,
        },
        {
            type: CommandTypes.Color,
            name: "White",
            description: "Pollinate with white light",
            command: "#FFFFFF",
        },
        {
            type: CommandTypes.Color,
            name: "Red",
            description: "Pollinate with red light",
            command: "#FF0000",
        },
        {
            type: CommandTypes.Color,
            name: "Rainbow",
            description: "Pollinate a rainbow",
            command: "rainbow",
        },
    ];

    const motionCards: Command[] = [
        {
            type: CommandTypes.Motion,
            name: "Swirl",
            description: "Swirl around",
            command: "swirl",
        },
    ];

    const findCard = (name: string, type: CommandTypes) => {
        const card = [...colorCards, ...motionCards].find(
            (card) => card.name === name && card.type === type,
        );
        return card;
    };

    const cardSelected = (name: string, type: CommandTypes) => {
        const card = findCard(name, type);
        if (!card) return;
        if (card.type === CommandTypes.Color) {
            setSelectedColorCard(card.name);
            card.name === "Custom"
                ? setColorPickerVisible(true)
                : setColorPickerVisible(false);
        } else if (card.type === CommandTypes.Motion) {
            setSelectedMotionCard(card.name);
        }
        pollinateFlowers({ [card.type]: card.command });

        // update flower cards
        for (const index in selectedFlowers) {
            const flower = selectedFlowers[index];
            flower.selectedControlCards.push({
                type: card.type,
                name: card.name,
            });
            updateFlowers(flower, props.setFlowers);
        }
    };

    const pollinateFlowers = (command: { [key: string]: string }) => {
        if (bleContext) {
            for (const index in selectedFlowers) {
                const flower = selectedFlowers[index];
                if (flower.connected) {
                    bleContext.write(flower.id, JSON.stringify(command));
                }
            }
        }
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({ [CommandTypes.Color]: customColor });
        }, 100);

        return () => clearTimeout(debounceTimeout);
    }, [customColor]);

    useEffect(() => {
        const commandControlCards: Array<CommandCardId[]> = selectedFlowers.map(
            (f) => f.selectedControlCards,
        );

        if (commandControlCards.length === 0) return;

        const intersectingSet: CommandCardId[] = commandControlCards.reduce(
            (acc, set) => acc.filter((item) => set.includes(item)),
        );

        for (const cardId of intersectingSet) {
            if (cardId.type === CommandTypes.Color) {
                setSelectedColorCard(cardId.name);
            } else if (cardId.type === CommandTypes.Motion) {
                setSelectedMotionCard(cardId.name);
            }
        }
    }, [selectedFlowers]);

    const handlePickerClick = (event) => {
        event.stopPropagation();
        setColorPickerVisible(true);
    };

    const handleParentClick = () => {
        if (colorPickerVisible) {
            setColorPickerVisible(false);
        }
    };

    return (
        <div onClick={handleParentClick} style={{ position: "relative" }}>
            <FlowerSelector
                flowers={Object.values(props.flowers)}
                selectedFlowers={selectedFlowers}
                setSelectedFlowers={setSelectedFlowers}
            />
            <SectionSeparator text="Color" />
            <Grid
                columns={isMobile ? "2" : "3"}
                gap="5"
                rows="repeat(0, 200px)"
                width="auto"
            >
                {colorCards.map((card, i) => {
                    return (
                        <ControlCard
                            key={i}
                            id={i}
                            label={card.name}
                            description={card.description}
                            selected={card.name === selectedColorCard}
                            onClick={() => cardSelected(card.name, card.type)}
                        />
                    );
                })}
                {colorPickerVisible && (
                    <div
                        onClick={handlePickerClick}
                        style={{ position: "absolute" }}
                    >
                        <HexColorPicker
                            color={customColor}
                            onChange={setCustomColor}
                            style={{
                                position: "absolute",
                                marginTop: "135px",
                            }}
                        />
                    </div>
                )}
            </Grid>
            <SectionSeparator text="Motion" />
            <Grid
                columns={isMobile ? "2" : "3"}
                gap="5"
                rows="repeat(0, 200px)"
                width="auto"
            >
                {motionCards.map((card, i) => {
                    return (
                        <ControlCard
                            key={i}
                            id={i}
                            label={card.name}
                            description={card.description}
                            selected={card.name === selectedMotionCard}
                            onClick={() => cardSelected(card.name, card.type)}
                        />
                    );
                })}
            </Grid>
        </div>
    );
};

export default ControlGrid;
