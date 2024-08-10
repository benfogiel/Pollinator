import React, { FC } from "react";

import Box from "../common/Box";
import { Card } from "../common/Card";

interface ControlCardProps {
    id: number;
    label: string;
    selected?: boolean;
    onClick: (id: number) => void;
}

const ControlCard: FC<ControlCardProps> = ({
    id,
    label,
    selected,
    onClick,
}) => {
    return (
        <Box id={id} selected={selected || false} onClick={() => onClick(id)}>
            <Card title={label} />
        </Box>
    );
};

export default ControlCard;
