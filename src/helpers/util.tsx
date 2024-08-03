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
};

export const flowerDisconnected = (
    flowerId: string,
    setFlowers: (
        flowersUpdater: (
            prevFlowers: Record<string, Flower>,
        ) => Record<string, Flower>,
    ) => void,
) => {
    setFlowers((prevFlowers) => {
        const updatedFlowers = { ...prevFlowers };
        if (updatedFlowers[flowerId] !== undefined) {
            updatedFlowers[flowerId].connected = false;
        }
        return updatedFlowers;
    });
};

export const createPollinationSequence = (sequence: string[]) => {
    return `{pollination_sequence: ${JSON.stringify(sequence)}}`;
};
