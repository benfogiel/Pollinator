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

export const createPollinationSequence = (sequence: string[]) => {
    return `{pollination_sequence: ${JSON.stringify(sequence)}}`;
};
