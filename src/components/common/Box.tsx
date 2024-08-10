import React, { FC } from "react";
import { Box as RadixBox } from "@radix-ui/themes";

export interface BoxProps {
    id: string | number;
    maxWidth: string;
    minHeight: string;
    onClick: (id: string | number) => void;
    selected: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const Box: FC<BoxProps> = (props) => {
    const boxStyle = {
        backgroundColor: "var(--pol-bg-1)",
        borderRadius: "10px",
        margin: "10px",
        padding: props.selected ? "3px" : "5px",
        border: props.selected ? "2px solid var(--pol-ultra-red)" : "none",
        cursor: "pointer",
        ...props.style,
    };

    return (
        <RadixBox
            maxWidth={props.maxWidth}
            minHeight={props.minHeight}
            style={boxStyle}
            onClick={() => props.onClick(props.id)}
        >
            {props.children}
        </RadixBox>
    );
};

export default Box;
