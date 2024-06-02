// Service to retrieve previously connected flowers

import { FLOWER_ANCESTRY_LS_KEY } from "../constants";
import { Flower } from "../interfaces/interfaces";

export const getFlowerAncestry = (): Array<Flower> => {
    // if not connected to DB, use local storage
    const ancestors: string | null = localStorage.getItem(
        FLOWER_ANCESTRY_LS_KEY,
    );

    try {
        return ancestors ? JSON.parse(ancestors) : [];
    } catch {
        console.error(
            "Failed to parse flower_ancestors local storage variable.",
        );
        return [];
    }
};

export const updateFlowerAncestry = (flower: Flower): void => {
    // if not connected to DB, use local storage

    // get existing ancestors
    const ancestors_str: string | null = localStorage.getItem(
        FLOWER_ANCESTRY_LS_KEY,
    );
    let ancestors: Array<Flower>;
    try {
        ancestors = ancestors_str ? JSON.parse(ancestors_str) : [];
    } catch {
        console.error(
            "Failed to parse flower_ancestors local storage variable. Overwriting ancestry.",
        );
        ancestors = [];
    }

    // delete any ancestors with the same IP
    ancestors = ancestors.filter((ancestor) => ancestor.ip !== flower.ip);

    localStorage.setItem(
        FLOWER_ANCESTRY_LS_KEY,
        JSON.stringify([...ancestors, flower]),
    );
};
