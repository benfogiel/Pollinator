export interface Flower {
    id: string;
    name: string;
    description: string;
    ip: string;
    port: number;
    connected?: boolean;
    controlCardId?: string;
}

export interface Control {
    id: string;
    name: string;
    description: string;
    command: string;
}

export interface DeviceInfo {
    id: string;
    ip: string;
    port: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export interface WebSocketContextType {
    webSockets: Map<string, WebSocket>;
    addDevice: (device: DeviceInfo) => void;
    removeDevice: (deviceId: string) => void;
    sendMessage: (deviceId: string, message: string) => void;
}
