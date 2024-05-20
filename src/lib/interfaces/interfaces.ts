export interface Flower {
    id: string;
    name: string;
    description: string;
    ip: string;
    port: number;
    controlCardId?: string;
}

export interface Control {
    id: string;
    name: string;
    description: string;
    command: string;
}
