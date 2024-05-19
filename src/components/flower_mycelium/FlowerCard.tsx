import React, { FC } from "react";
import { Box, Text } from "@radix-ui/themes";

import { Flower } from "../../interfaces/interfaces";
import { Card } from "../common/Card";

export interface FlowerCardProps {
    id: string;
    flowerParams?: Flower;
    selected?: boolean;
    onClick: (id: string) => void;
}

const FlowerCard: FC<FlowerCardProps> = ({
    id,
    flowerParams,
    selected,
    onClick,
}) => {
    const boxStyle = {
        backgroundColor: "var(--pol-bg-1)",
        borderRadius: "10px",
        margin: "10px",
        border: "none",
        cursor: "pointer",
    };
    if (selected) {
        boxStyle.border = "2px solid pol-ultra-red";
        boxStyle.margin = "8px";
    }

    return (
        <Box
            maxWidth="360px"
            minHeight="120px"
            style={boxStyle}
            onClick={() => onClick(id)}
        >
            {flowerParams ? (
                <Card
                    label={flowerParams.name}
                    description={flowerParams.description}
                />
            ) : (
                <Text
                    style={{
                        color: "var(--pol-ultra-red)",
                        fontWeight: "bold",
                        fontSize: "24px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    +
                </Text>
            )}
        </Box>
    );
};

export default FlowerCard;
