import React, { useState, FC, useEffect } from "react";
import { Box as RadixBox, CheckboxCards, Flex, Text } from "@radix-ui/themes";

import { Flower } from "../../lib/interfaces/interfaces";
import Box from "./Box";

interface FlowerSelectorProps {
    flowers: Flower[];
    selectedFlowers: Flower[];
    setSelectedFlowers: (flowers: Flower[]) => void;
}

export const FlowerSelector: FC<FlowerSelectorProps> = (props) => {
    const [selectedValues, setSelectedValues] = useState(
        props.flowers.map((flower) => flower.id),
    );

    useEffect(() => {
        props.setSelectedFlowers(
            props.flowers.filter((flower) =>
                selectedValues.includes(flower.id),
            ),
        );
    }, [selectedValues]);

    return (
        <RadixBox maxWidth="600px">
            <CheckboxCards.Root
                value={selectedValues}
                onValueChange={setSelectedValues}
                columns={{ initial: "4", sm: "5" }}
            >
                {props.flowers.map((flower) => (
                    <CheckboxCards.Item key={flower.id} value={flower.id}>
                        <Flex direction="column" width="100%">
                            <Box
                                id={flower.id}
                                maxWidth="75px"
                                minHeight="25px"
                                onClick={() => console.log(flower)}
                                selected={selectedValues.includes(flower.id)}
                            >
                                <Text
                                    weight="bold"
                                    style={{
                                        color: "var(--pol-text-1)",
                                        fontSize: "12px",
                                    }}
                                >
                                    {flower.name}
                                </Text>
                            </Box>
                        </Flex>
                    </CheckboxCards.Item>
                ))}
            </CheckboxCards.Root>
        </RadixBox>
    );
};
