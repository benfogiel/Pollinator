import React, { FC } from "react";
import { Card as RadixCard, Text } from "@radix-ui/themes";

interface CardProps {
    title: string;
    description: string;
    status?: boolean;
}

export const Card: FC<CardProps> = ({ title, description, status }) => {
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
                <Text
                    as="div"
                    style={{ color: "var(--pol-text-1)", fontSize: "12px" }}
                >
                    {description}
                </Text>
            </a>
        </RadixCard>
    );
};
