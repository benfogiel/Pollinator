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
    CommandCard,
} from "../../helpers/interfaces";
import { updateFlowers } from "../../helpers/util";
import {
    colorCommandCards,
    motionCommandCards,
    commandToCommandCard,
} from "../../config/commands";
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
    const [customGradPicker, setCustomGradPicker] = useState<boolean>(false);

    const [selectedColorCard, setSelectedColorCard] =
        useState<CommandCard | null>(null);
    const [selectedMotionCard, setSelectedMotionCard] = useState<CommandCard[]>(
        [],
    );
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);
    const [customColor, setCustomColor] = useState<string>("#9F00FF");
    const [customGrad1, setCustomGrad1] = useState<string>("#FF0000");
    const [customGrad2, setCustomGrad2] = useState<string>("#FFFF00");
    const [selectedBrightness, setSelectedBrightness] = useState<number>(50);
    const [selectedSpeed, setSelectedSpeed] = useState<number>(50);

    const colorCards: CommandCard[] = colorCommandCards;
    const motionCards: CommandCard[] = motionCommandCards;

    const findCard = (name: string, type: CommandTypes) => {
        const card = [...colorCards, ...motionCards].find(
            (card) => card.name === name && card.command.type === type,
        );
        return card;
    };

    const cardSelected = (name: string, type: CommandTypes) => {
        const card = findCard(name, type);
        if (!card) return;
        if (card.command.type === CommandTypes.Color) {
            setSelectedColorCard(card);
            card.name === "Custom"
                ? setColorPickerVisible(true)
                : setColorPickerVisible(false);
            card.name === "Gradient"
                ? setCustomGradPicker(true)
                : setCustomGradPicker(false);
        } else if (card.command.type === CommandTypes.Motion) {
            if (selectedMotionCard.map((cmd) => cmd.name).includes(card.name)) {
                setSelectedMotionCard(
                    selectedMotionCard.filter((cmd) => cmd.name !== card.name),
                );
            } else {
                setSelectedMotionCard([...selectedMotionCard, card]);
            }
        }
    };

    const pollinateFlowers = (command: {
        [key: string]: string | string[];
    }) => {
        if (bleContext) {
            for (const index in selectedFlowers) {
                const flower = selectedFlowers[index];
                if (flower.connected) {
                    bleContext.write(
                        JSON.stringify(command),
                        flower.device.deviceId,
                        flower.cmd_char_uuid,
                    );
                }
            }
        }
    };

    const handlePickerClick = (event) => {
        event.stopPropagation();
        setColorPickerVisible(true);
    };

    const handleGradPickerClick = (event) => {
        event.stopPropagation();
        setCustomGradPicker(true);
    };

    const handleParentClick = () => {
        if (colorPickerVisible) {
            setColorPickerVisible(false);
        }
        if (customGradPicker) {
            setCustomGradPicker(false);
        }
    };

    useEffect(() => {
        // update flower cards
        for (const index in selectedFlowers) {
            const flower = selectedFlowers[index];
            flower.selectedCommands = [];
            if (selectedColorCard)
                flower.selectedCommands.push(selectedColorCard.command);
            if (selectedMotionCard)
                flower.selectedCommands.push(
                    ...selectedMotionCard.map((cmd) => cmd.command),
                );
            updateFlowers(flower, props.setFlowers);
        }
    }, [selectedColorCard, selectedMotionCard]);

    useEffect(() => {
        if (selectedColorCard) {
            pollinateFlowers({
                [selectedColorCard.command.type]:
                    selectedColorCard.command.command,
            });
        }
    }, [selectedColorCard]);

    useEffect(() => {
        pollinateFlowers({
            [CommandTypes.Motion]: selectedMotionCard.map(
                (cmd) => cmd.command.command,
            ),
        });
    }, [selectedMotionCard]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({ [CommandTypes.Color]: customColor });
        }, 15);

        return () => clearTimeout(debounceTimeout);
    }, [customColor]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({
                [CommandTypes.Color]: `grad,${customGrad1},${customGrad2}`,
            });
        }, 15);

        return () => clearTimeout(debounceTimeout);
    }, [customGrad1, customGrad2]);

    useEffect(() => {
        const commandControlCards: Array<Command[]> = selectedFlowers.map(
            (f) => f.selectedCommands,
        );

        if (commandControlCards.length === 0) return;

        const intersectingSet: Command[] = commandControlCards.reduce(
            (acc, set) => acc.filter((item) => set.includes(item)),
        );

        const motionCmds: Command[] = [];
        for (const cmd of intersectingSet) {
            if (cmd.type === CommandTypes.Color) {
                setSelectedColorCard(commandToCommandCard(cmd));
            } else if (cmd.type === CommandTypes.Motion) {
                motionCmds.push(cmd);
            }
        }
        if (motionCmds.length > 0) {
            setSelectedMotionCard(
                motionCmds.flatMap((cmd) => commandToCommandCard(cmd) ?? []),
            );
        }
    }, [selectedFlowers]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({
                [CommandTypes.Brightness]: selectedBrightness.toString(),
            });
        }, 15);

        return () => clearTimeout(debounceTimeout);
    }, [selectedBrightness]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            pollinateFlowers({
                [CommandTypes.Speed]: selectedSpeed.toString(),
            });
        }, 15);

        return () => clearTimeout(debounceTimeout);
    }, [selectedSpeed]);

    return (
        <div onClick={handleParentClick} style={{ position: "relative" }}>
            {Object.values(props.flowers).filter((f) => f.connected).length && (
                <SectionSeparator text="Connected" />
            )}
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
                            selected={card.name === selectedColorCard?.name}
                            onClick={() =>
                                cardSelected(card.name, card.command.type)
                            }
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
                        style={{
                            position: "absolute",
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "75px",
                        }}
                    >
                        <HexColorPicker
                            color={customGrad1}
                            onChange={setCustomGrad1}
                            style={{
                                position: "relative",
                            }}
                        />
                        <HexColorPicker
                            color={customGrad2}
                            onChange={setCustomGrad2}
                            style={{
                                position: "relative",
                                zIndex: 99,
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
                            selected={selectedMotionCard
                                ?.map((cmd) => cmd.name)
                                .includes(card.name)}
                            onClick={() =>
                                cardSelected(card.name, card.command.type)
                            }
                        />
                    );
                })}
            </Grid>
        </div>
    );
};

export default ControlGrid;
