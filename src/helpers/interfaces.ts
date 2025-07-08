import { BleDevice } from "@capacitor-community/bluetooth-le";

export interface Flower {
    id: string;
    name: string;
    device: BleDevice;
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
    name: string;
}
