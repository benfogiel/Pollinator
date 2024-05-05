import { FC } from 'react';
import { Box } from '@radix-ui/themes';

import Card from "../common/Card";

interface FlowerCardProps {
    id: number;
    label: string;
    description: string;
    selected?: boolean;
    onClick: (id: number) => void
}

const FlowerCard: FC<FlowerCardProps> = ({ id, label, description, selected, onClick }) => {

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
        <Box maxWidth="360px" minHeight="120px" style={boxStyle} onClick={() => onClick(id)}>
            <Card label={label} description={description} />
        </Box>
    )
};

export default FlowerCard;