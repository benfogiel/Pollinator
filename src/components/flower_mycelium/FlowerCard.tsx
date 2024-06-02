import React, { FC } from "react";
import { Text } from "@radix-ui/themes";

import Box from "../common/Box";
import { Flower } from "../../lib/interfaces";
import { Card } from "../common/Card";

export interface FlowerCardProps {
    id: string;
    flowerParams?: Flower;
    selected?: boolean;
    onClick: (id: string) => void;
}

const FlowerCard: FC<FlowerCardProps> = React.forwardRef<
    HTMLDivElement,
    FlowerCardProps
>((props, ref) => {
    return (
        <div ref={ref}>
            <Box
                id={props.id}
                selected={props.selected || false}
                maxWidth="360px"
                minHeight="120px"
                onClick={() => props.onClick(props.id)}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {props.flowerParams ? (
                    <Card
                        title={props.flowerParams.name}
                        description={props.flowerParams.description}
                        status={props.flowerParams.connected}
                    />
                ) : (
                    <Text
                        style={{
                            color: "var(--pol-ultra-red)",
                            fontWeight: "bold",
                            fontSize: "24px",
                        }}
                    >
                        +
                    </Text>
                )}
            </Box>
        </div>
    );
});

export default FlowerCard;
