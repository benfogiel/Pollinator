import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    FC,
} from "react";

import { WebSocketContextType, DeviceInfo } from "../interfaces";

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = (): WebSocketContextType | null =>
    useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
}

const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
    const [webSockets, setWebSockets] = useState<Map<string, WebSocket>>(
        new Map(),
    );

    const addDevice = (device: DeviceInfo, timeoutMs: number = 5000) => {
        const address: string = `${device.ip}:${device.port}`;
        return new Promise<void>((resolve, reject) => {
            if (webSockets.get(device.id)) {
                console.error("Device websocket is already connected.");
                reject(new Error("Device websocket is already connected."));
                return;
            }
            const websocket = new WebSocket(`ws://${address}`);

            // set connection timeout
            const connTimeout = setTimeout(() => {
                websocket.close();
                reject(new Error(`WebSocket connection timed out: ${address}`));
            }, timeoutMs);

            websocket.onopen = () => {
                console.info(`WebSocket Connected to ${address}`);
                clearTimeout(connTimeout);
                device.onConnect && device.onConnect();
                resolve();
            };
            websocket.onerror = (error) => {
                clearTimeout(connTimeout);
                reject(new Error(`WebSocket Error on ${address} -- ${error}`));
            };
            websocket.onclose = () => {
                console.debug(`WebSocket Disconnected: ${address}`);
                clearTimeout(connTimeout);
                removeDevice(device.id);
                device.onDisconnect && device.onDisconnect();
            };

            setWebSockets(new Map(webSockets.set(device.id, websocket)));
        });
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
        <WebSocketContext.Provider
            value={{ webSockets, addDevice, removeDevice, sendMessage }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketProvider;
