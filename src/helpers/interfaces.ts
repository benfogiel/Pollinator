export interface Flower {
    id: string;
    name: string;
    description: string;
    connected?: boolean;
    selectedCommands: Array<Command>;
}

export enum CommandTypes {
    Color = "co",
    Motion = "mo",
    UpdateRate = "ur",
    Brightness = "br",
    Speed = "sp",
}

export interface Command {
    command: string;
    type: CommandTypes;
    name: string;
}
