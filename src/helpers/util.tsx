import { Flower } from "./interfaces";

export const updateFlowers = (
    flower: Flower,
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void,
) => {
    setFlowers((prevFlowers) => ({
        ...prevFlowers,
        [flower.id]: flower,
    }));

    // save flower IDs to local storage
    const prevStoredFlowerIds = localStorage.getItem("flowerIds");
    if (prevStoredFlowerIds) {
        const storedFlowerIds = new Set(prevStoredFlowerIds.split(","));
        storedFlowerIds.add(flower.id);
        localStorage.setItem(
            "flowerIds",
            Array.from(storedFlowerIds).join(","),
        );
    } else {
        localStorage.setItem("flowerIds", flower.id);
    }
};

export const updateFlowerConnection = (
    flowerId: string,
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void,
    connected: boolean,
) => {
    setFlowers((prevFlowers) => {
        const updatedFlowers = { ...prevFlowers };
        if (updatedFlowers[flowerId] !== undefined) {
            updatedFlowers[flowerId].connected = connected;
        }
        return updatedFlowers;
    });
};

export const splitIntoPackets = (
    data: string,
    maxPacketSize: number,
    terminator: string = ";",
): string[] => {
    const packets: string[] = [];
    for (let i = 0; i < data.length; i += maxPacketSize) {
        packets.push(data.substring(i, i + maxPacketSize));
    }
    if (
        packets[packets.length - 1].length <
        maxPacketSize - terminator.length
    ) {
        packets[packets.length - 1] += terminator;
    } else {
        packets.push(terminator);
    }
    return packets;
};
