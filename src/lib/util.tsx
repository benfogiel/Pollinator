import { Flower } from "./interfaces";

export const updateFlowers = (
    flower: Flower,
    flowers: Record<string, Flower>,
    setFlowers: (flowers: Record<string, Flower>) => void,
) => {
    const updatedFlowers = {
        ...flowers,
        [flower.id]: flower,
    };
    setFlowers(updatedFlowers);
};

export const createPollinationSequence = (sequence: string[]) => {
    return `{pollination_sequence: ${JSON.stringify(sequence)}}`;
};
