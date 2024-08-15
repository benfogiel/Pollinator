import React, { FC, useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import { Grid } from "@radix-ui/themes";
import { isMobile } from "react-device-detect";
import { HexColorPicker } from "react-colorful";

import { useBLE } from "../../helpers/BLEProvider";
import { Flower, CommandTypes, Command } from "../../helpers/interfaces";
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
    const [customGradPicker, setCustomGradPicker] = useState<boolean>(false);

    const [selectedColorCmd, setSelectedColorCmd] = useState<Command | null>(
        null,
    );
    const [selectedMotionCmds, setSelectedMotionCmds] = useState<Command[]>([]);
    const [selectedFlowers, setSelectedFlowers] = useState<Flower[]>([]);
    const [customColor, setCustomColor] = useState<string>("#9F00FF");
    const [customGrad1, setCustomGrad1] = useState<string>("#FF0000");
    const [customGrad2, setCustomGrad2] = useState<string>("#FFFF00");
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
            name: "Gradient",
            command: `gradient,${customGrad1},${customGrad2}`,
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
            name: "Yellow",
            command: "#FFFF00",
        },
        {
            type: CommandTypes.Color,
            name: "Rainbow",
            command: "rainbow",
        },
        {
            type: CommandTypes.Color,
            name: "Red-Yellow",
            command: "gradient,#FF0000,#FFFF00",
        },
        {
            type: CommandTypes.Color,
            name: "Yellow-Pink",
            command: "gradient,#FFFF00,#FF00FF",
        },
    ];

    const motionCards: Command[] = [
        {
            type: CommandTypes.Motion,
            name: "Swirl",
            command: "swirl",
        },
        {
            type: CommandTypes.Motion,
            name: "Breathe",
            command: "breathe",
        },
        {
            type: CommandTypes.Motion,
            name: "Flash",
            command: "flash",
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
            card.name === "Gradient"
                ? setCustomGradPicker(true)
                : setCustomGradPicker(false);
        } else if (card.type === CommandTypes.Motion) {
            if (selectedMotionCmds.map((cmd) => cmd.name).includes(card.name)) {
                setSelectedMotionCmds(
                    selectedMotionCmds.filter((cmd) => cmd.name !== card.name),
                );
            } else {
                setSelectedMotionCmds([...selectedMotionCmds, card]);
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
                    bleContext.write(flower.id, JSON.stringify(command));
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
            pollinateFlowers({ [CommandTypes.Color]: customColor });
        }, 250);

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
                setSelectedColorCmd(cmd);
            } else if (cmd.type === CommandTypes.Motion) {
                motionCmds.push(cmd);
            }
        }
        setSelectedMotionCmds(motionCmds);

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
                            selected={card.name === selectedColorCmd?.name}
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
                            selected={selectedMotionCmds
                                ?.map((cmd) => cmd.name)
                                .includes(card.name)}
                            onClick={() => cardSelected(card.name, card.type)}
                        />
                    );
                })}
            </Grid>
        </div>
    );
};

export default ControlGrid;
