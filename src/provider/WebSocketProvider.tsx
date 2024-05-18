import React, { createContext, useContext, useState, ReactNode, FC } from "react";

interface DeviceInfo {
    id: string;
    ip: string;
    port: number;
}

interface WebSocketContextType {
    webSockets: Map<string, WebSocket>;
    addDevice: (device: DeviceInfo) => void;
    removeDevice: (deviceId: string) => void;
    sendMessage: (deviceId: string, message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = (): WebSocketContextType | null => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
    const [webSockets, setWebSockets] = useState<Map<string, WebSocket>>(new Map());

    const addDevice = (device: DeviceInfo) => {
        if (webSockets.get(device.id)) {
            console.error("Device websocket is already connected.");
            return;
        }
        const websocket = new WebSocket(`ws://${device.ip}:${device.port}`);

        websocket.onopen = () => console.log(`WebSocket Connected: ${device.id}`);
        websocket.onerror = (error) => console.error(`WebSocket Error on ${device.id}: `, error);
        websocket.onclose = () => {
            console.log(`WebSocket Disconnected: ${device.id}`);
            webSockets.delete(device.id);
        };

        setWebSockets(new Map(webSockets.set(device.id, websocket)));
    };

    const removeDevice = (deviceId: string) => {
        const ws = webSockets.get(deviceId);
        if (ws) {
            ws.close();
            webSockets.delete(deviceId);
            setWebSockets(new Map(webSockets));
        }
    };

    const sendMessage = (deviceId: string, message: string) => {
        const ws = webSockets.get(deviceId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        } else {
            console.error(`WebSocket is not connected for device ${deviceId}.`);
        }
    };

    return (
        <WebSocketContext.Provider value={{ webSockets, addDevice, removeDevice, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketProvider;