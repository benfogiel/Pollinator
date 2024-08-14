export interface Flower {
    id: string;
    name: string;
    description: string;
    connected?: boolean;
    selectedCommands: Array<Command>;
}

export enum CommandTypes {
    Color = "color",
    Motion = "motion",
}

export interface Command {
    command: string;
    type: CommandTypes;
    name: string;
}
