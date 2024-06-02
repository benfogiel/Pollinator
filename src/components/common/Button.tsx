import React, { FC, useState } from "react";
import { Text } from "@radix-ui/themes";

import Box from "./Box";

export interface ButtonProps {
    text: string;
    width?: string;
    height?: string;
    onClick: () => Promise<void> | void;
}

const Button: FC<ButtonProps> = ({
    text,
    width = "100px",
    height = "35px",
    onClick,
}) => {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        const callback = onClick();
        // check if onClick returns a promise
        if (callback && typeof callback.then === "function") {
            setLoading(true);
            callback.finally(() => setLoading(false));
        }
    };

    return (
        <Box
            id={0}
            maxWidth={width}
            minHeight={height}
            onClick={handleClick}
            selected={false}
            style={{
                padding: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <Text
                    weight="bold"
                    style={{
                        color: "var(--pol-text-1)",
                        fontSize: "12px",
                    }}
                >
                    {text}
                </Text>
            )}
        </Box>
    );
};

export default Button;
