export interface Flower {
    id: string;
    name: string;
    description: string;
    connected?: boolean;
    controlCardId?: number;
}

// enum
export enum CommandTypes {
    Static = "static",
    Dynamic = "dynamic",
}

export interface Command {
    id: string;
    type: CommandTypes;
    name: string;
    description: string;
    command: string;
}
