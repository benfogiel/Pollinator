import React, { FC } from "react";
import { Card as RadixCard, Text } from "@radix-ui/themes";

interface CardProps {
    title: string;
    status?: boolean;
}

export const Card: FC<CardProps> = ({ title, status }) => {
    return (
        <RadixCard asChild style={{ margin: "10px" }}>
            <a href="#control-card">
                <div className="flex">
                    <Text
                        style={{
                            color: "var(--pol-ultra-red)",
                            fontWeight: "bold",
                            alignContent: "left",
                        }}
                    >
                        {title}
                    </Text>
                    {status !== undefined ? (
                        <div
                            className={`circle ${status ? "good" : "bad"} self-center ml-2`}
                        ></div>
                    ) : (
                        <></>
                    )}
                </div>
            </a>
        </RadixCard>
    );
};
