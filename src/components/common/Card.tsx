import { FC } from 'react';
import { Card as RadixCard, Text } from '@radix-ui/themes';

interface CardProps {
    label: string;
    description: string;
}

export const Card: FC<CardProps> = ({ label, description }) => {

    return (
        <RadixCard asChild style={{ margin: "10px"}}>
            <a href="#control-card">
                <Text style={{ color: 'var(--pol-ultra-red)', fontWeight: "bold" }}>
                    {label}
                </Text>
                <Text as="div" style={{ color: "var(--pol-text-1)", fontSize: "12px"}}>
                    {description}
                </Text>
            </a>
        </RadixCard>
    )
};