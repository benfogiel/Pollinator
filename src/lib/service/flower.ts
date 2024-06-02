import { Flower, WebSocketContextType } from "../interfaces";

export const connectFlower = async (
    websocketContext: WebSocketContextType,
    flower: Flower,
    onConnect: (flower: Flower) => void,
    onDisconnect: (flower: Flower) => void,
    onFailed?: () => void,
): Promise<boolean> => {
    try {
        await websocketContext.addDevice({
            id: flower.id,
            ip: flower.ip,
            port: flower.port,
            onConnect: () => {
                // successfully connected
                flower.connected = true;
                onConnect(flower);
            },
            onDisconnect: () => onDisconnect(flower),
        });

        return true;
    } catch (err) {
        onFailed
            ? onFailed()
            : console.error(
                  `Failed to connect to device ${flower.ip}:${flower.port}`,
              );
    }

    return false;
};

// export const pingFlower =
