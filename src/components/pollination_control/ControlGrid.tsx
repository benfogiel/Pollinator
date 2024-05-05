import React, { FC, useState } from 'react';
import '@radix-ui/themes/styles.css';
import { Grid } from '@radix-ui/themes';
import { isMobile } from 'react-device-detect';

import ControlCard from './ControlCard';

const ControlGrid: FC = () => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const controlCards = [
        {
            label: "Flashing",
            description: "Flashes all flowers",
        },
        {
            label: "Pulsing",
            description: "Pulsates the brightness",
        },
        {
            label: "Another 1",
            description: "Some description",
        },
        {
            label: "Another 2",
            description: "Flashes all flowers",
        },
    ];

    const selectCard = (id: number) => {
        setSelectedCard(id);
    }

    return (
        <Grid columns={isMobile ? "2" : "3"} gap="5" rows="repeat(0, 200px)" width="auto">
            {
                controlCards.map((card, i) => {
                        return (
                            <ControlCard
                                id={i}
                                label={card.label}
                                description={card.description}
                                selected={i === selectedCard}
                                onClick={selectCard}
                            />
                        )
                })
            }
        </Grid>
    )
};

export default ControlGrid;