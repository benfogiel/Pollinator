import React, { FC } from "react";
import { Text } from "@radix-ui/themes";

import Box from "../common/Box";
import { Flower } from "../../helpers/interfaces";
import { Card } from "../common/Card";

export interface FlowerCardProps {
    key: string;
    id: string;
    flowerParams?: Flower;
    selected?: boolean;
    onClick?: (id: string) => void;
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
                onClick={() => props.onClick?.(props.id)}
            >
                {props.flowerParams ? (
                    <Card
                        title={props.flowerParams.name}
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
