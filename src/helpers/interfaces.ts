export interface Flower {
    id: string;
    name: string;
    description: string;
    connected?: boolean;
    controlCardId?: number;
}

export interface Control {
    id: string;
    name: string;
    description: string;
    command: string;
}
