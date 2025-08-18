import {
    Command,
    CommandCard,
    CommandTypes,
    commandEquals,
} from "../helpers/interfaces";

export const colorCommandCards: CommandCard[] = [
    {
        name: "Custom",
        command: {
            type: CommandTypes.Color,
            command: "",
        },
    },
    {
        name: "Gradient",
        command: {
            type: CommandTypes.Color,
            command: "",
        },
    },
    {
        name: "White",
        command: {
            type: CommandTypes.Color,
            command: "#FFFFFF",
        },
    },
    {
        name: "Red",
        command: {
            type: CommandTypes.Color,
            command: "#FF0000",
        },
    },
    {
        name: "Yellow",
        command: {
            type: CommandTypes.Color,
            command: "#FFFF00",
        },
    },
    {
        name: "Rainbow",
        command: {
            type: CommandTypes.Color,
            command: "rainbow",
        },
    },
    {
        name: "Rainbow 2",
        command: {
            type: CommandTypes.Color,
            command: "rainbow2",
        },
    },
    {
        name: "Red-Yellow",
        command: {
            type: CommandTypes.Color,
            command: "grad,#FF0000,#FFFF00",
        },
    },
    {
        name: "Yellow-Pink",
        command: {
            type: CommandTypes.Color,
            command: "grad,#FFFF00,#FF00FF",
        },
    },
];

export const motionCommandCards: CommandCard[] = [
    {
        name: "Swirl",
        command: {
            type: CommandTypes.Motion,
            command: "swirl",
        },
    },
    {
        name: "Ext Swirl",
        command: {
            type: CommandTypes.Motion,
            command: "extended_swirl",
        },
    },
    {
        name: "Breathe",
        command: {
            type: CommandTypes.Motion,
            command: "breathe",
        },
    },
    {
        name: "Flash",
        command: {
            type: CommandTypes.Motion,
            command: "flash",
        },
    },
    {
        name: "Radiate",
        command: {
            type: CommandTypes.Motion,
            command: "radiate",
        },
    },
];

export const commandToCommandCard = (command: Command): CommandCard | null => {
    const gradientRegex = /^grad,#[0-9a-fA-F]{3,6},#[0-9a-fA-F]{3,6}$/;
    const colorRegex = /^#[0-9a-fA-F]{3,6}$/;

    const cards = [...colorCommandCards, ...motionCommandCards];
    for (const card of cards) {
        if (commandEquals(card.command, command)) {
            return card;
        } else if (card.name === "Custom" && colorRegex.test(command.command)) {
            return { ...card, command: command };
        } else if (
            card.name === "Gradient" &&
            gradientRegex.test(command.command)
        ) {
            return { ...card, command: command };
        }
    }
    return null;
};
