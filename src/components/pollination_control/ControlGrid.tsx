import React, { FC, useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { HexColorPicker } from "react-colorful";

import { useWebSocket } from "../../lib/provider/WebSocketProvider";
import { Flower, Control } from "../../lib/interfaces";
import { createPollinationSequence, updateFlowers } from "../../lib/util";
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

const ControlGrid: FC<ControlGridProps> = (props) => {
    const bleContext = useBLE();
    const [colorPickerVisible, setColorPickerVisible] =
        useState<boolean>(false);

    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);
    const [customColor, setCustomColor] = useState<string>("#9F00FF");
    const [selectedBrightness, setSelectedBrightness] = useState<number>(50);
    const [selectedSpeed, setSelectedSpeed] = useState<number>(50);

    const controlCards: Control[] = [
        {
            id: "0",
            name: "Custom",
            description: "Pollinate with your light",
            command: customColor,
        },
        {
            type: CommandTypes.Color,
            name: "Gradient",
            command: `gradient,${customGrad1},${customGrad2}`,
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
            setSelectedColorCmd(card);
            card.name === "Custom"
                ? setColorPickerVisible(true)
                : setColorPickerVisible(false);
        } else if (card.type === CommandTypes.Motion) {
            if (selectedMotionCmds.map((cmd) => cmd.name).includes(card.name)) {
                setSelectedMotionCmds(
                    selectedMotionCmds.filter((cmd) => cmd.name !== card.name),
                );
                flower.controlCardId = cardId;
                updateFlowers(flower, props.setFlowers);
            }
        }
    };

    const setFlowerColor = (color: string) => {
        if (websocketContext) {
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
        // update flower cards
        for (const index in selectedFlowers) {
            const flower = selectedFlowers[index];
            flower.selectedCommands = [];
            if (selectedColorCmd)
                flower.selectedCommands.push(selectedColorCmd);
            if (selectedMotionCmds)
                flower.selectedCommands.push(...selectedMotionCmds);
            updateFlowers(flower, props.setFlowers);
        }
    }, [selectedColorCmd, selectedMotionCmds]);

    useEffect(() => {
        if (selectedColorCmd) {
            pollinateFlowers({
                [selectedColorCmd.type]: selectedColorCmd.command,
            });
        }
    }, [selectedColorCmd]);

    useEffect(() => {
        pollinateFlowers({
            [CommandTypes.Motion]: selectedMotionCmds.map((cmd) => cmd.command),
        });
    }, [selectedMotionCmds]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setFlowerColor(customColor);
        }, 1000);

        return () => clearTimeout(debounceTimeout);
    }, [customColor]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({
                [CommandTypes.Color]: `gradient,${customGrad1},${customGrad2}`,
            });
        }, 250);

        return () => clearTimeout(debounceTimeout);
    }, [customGrad1, customGrad2]);

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
                            onClick={selectCard}
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
                                marginTop: "75px",
                            }}
                        />
                    </div>
                )}
                {customGradPicker && (
                    <div
                        onClick={handleGradPickerClick}
                        style={{ position: "absolute" }}
                    >
                        <HexColorPicker
                            color={customGrad1}
                            onChange={setCustomGrad1}
                            style={{
                                position: "absolute",
                                marginTop: "75px",
                            }}
                        />
                        <HexColorPicker
                            color={customGrad2}
                            onChange={setCustomGrad2}
                            style={{
                                position: "absolute",
                                marginTop: "75px",
                                marginLeft: "200px",
                            }}
                        />
                    </div>
                )}
            </Grid>
        </>
    );
};

export default ControlGrid;
