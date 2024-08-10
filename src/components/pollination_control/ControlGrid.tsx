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
import Slider from "../common/Slider";

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
    const [colorPickerVisible, setColorPickerVisible] =
        useState<boolean>(false);

    const [selectedColorCard, setSelectedColorCard] = useState<string | null>(
        null,
    );
    const [selectedMotionCard, setSelectedMotionCard] = useState<string | null>(
        null,
    );
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);
    const [customColor, setCustomColor] = useState<string>("#9F00FF");
    const [selectedBrightness, setSelectedBrightness] = useState<number>(50);
    const [selectedSpeed, setSelectedSpeed] = useState<number>(50);

    const colorCards: Command[] = [
        {
            type: CommandTypes.Color,
            name: "Custom",
            command: customColor,
        },
        {
            type: CommandTypes.Color,
            name: "White",
            command: "#FFFFFF",
        },
        {
            type: CommandTypes.Color,
            name: "Red",
            command: "#FF0000",
        },
        {
            type: CommandTypes.Color,
            name: "Rainbow",
            command: "rainbow",
        },
    ];

    const motionCards: Command[] = [
        {
            type: CommandTypes.Motion,
            name: "Swirl",
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

    const handlePickerClick = (event) => {
        event.stopPropagation();
        setColorPickerVisible(true);
    };

    const handleParentClick = () => {
        if (colorPickerVisible) {
            setColorPickerVisible(false);
        }
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({ [CommandTypes.Color]: customColor });
        }, 250);

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

        // use current selected brightness and speed
        pollinateFlowers({
            brightness: selectedBrightness.toString(),
            speed: selectedSpeed.toString(),
        });
    }, [selectedFlowers]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({ brightness: selectedBrightness.toString() });
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [selectedBrightness]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({ speed: selectedSpeed.toString() });
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [selectedSpeed]);

    return (
        <div onClick={handleParentClick} style={{ position: "relative" }}>
            <SectionSeparator text="Connected" />
            <FlowerSelector
                flowers={Object.values(props.flowers)}
                selectedFlowers={selectedFlowers}
                setSelectedFlowers={setSelectedFlowers}
            />
            <SectionSeparator text="Color" />
            <Slider
                name="Brightness"
                value={[selectedBrightness]}
                onChange={(value: number[]) => setSelectedBrightness(value[0])}
            />
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
            <Slider
                name="Speed"
                value={[selectedSpeed]}
                onChange={(value: number[]) => setSelectedSpeed(value[0])}
            />
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
