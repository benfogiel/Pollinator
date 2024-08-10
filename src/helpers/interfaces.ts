export interface Flower {
    id: string;
    name: string;
    description: string;
    connected?: boolean;
    selectedControlCards: Array<CommandCardId>;
}

export enum CommandTypes {
    Color = "color",
    Motion = "motion",
}

export interface CommandCardId {
    type: CommandTypes;
    name: string;
}

export interface Command {
    command: string;
    type: CommandTypes;
    name: string;
}
