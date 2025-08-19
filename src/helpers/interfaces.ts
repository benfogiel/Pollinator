import { BleDevice } from "@capacitor-community/bluetooth-le";

export interface Flower {
    id: string;
    name: string;
    device: BleDevice;
    cmd_char_uuid: string;
    state_char_uuid: string;
    description: string;
    connected?: boolean;
    selectedCommands: Array<Command>;
}

export enum CommandTypes {
    Color = "co",
    Motion = "mo",
    Brightness = "br",
    Speed = "sp",
}

export interface Command {
    command: string;
    type: CommandTypes;
}

export interface CommandCard {
    name: string;
    command: Command;
}

export const commandEquals = (a: Command, b: Command): boolean => {
    return (
        a.type === b.type && a.command.toLowerCase() === b.command.toLowerCase()
    );
};

export const isCommandType = (value: string): value is CommandTypes => {
    return (Object.values(CommandTypes) as string[]).includes(value);
};
