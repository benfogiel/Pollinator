import React, { FC } from "react";

import Box from "../common/Box";
import { Card } from "../common/Card";

interface ControlCardProps {
    id: number;
    label: string;
    description: string;
    selected?: boolean;
    onClick: (id: number) => void;
}

const ControlCard: FC<ControlCardProps> = ({
    id,
    label,
    description,
    selected,
    onClick,
}) => {
    return (
        <Box
            id={id}
            maxWidth="360px"
            minHeight="120px"
            selected={selected || false}
            onClick={() => onClick(id)}
        >
            <Card title={label} description={description} />
        </Box>
    );
};

export default ControlCard;
