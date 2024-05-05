import React, { FC, useState } from 'react';
import '@radix-ui/themes/styles.css';
import { Grid } from '@radix-ui/themes';
import { isMobile } from 'react-device-detect';

import FlowerCard from './FlowerCard';
import NurseryModal from './NurseryModal';

const MyceliumGrid: FC = () => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const flowerCards = [
        {
            label: "Flower 1",
            description: "left",
        },
        {
            label: "Flower 2",
            description: "middle",
        },
        {
            label: "Flower 3",
            description: "right",
        },
        {
            label: "Flower 4",
            description: "bottom",
        },
        {
            label: "Flower 5",
            description: "top",
        }
    ];

    const selectCard = (id: number) => {
        setSelectedCard(id);
    }

    return (<>
        <Grid columns={isMobile ? "2" : "3"} gap="5" rows="repeat(0, 200px)" width="auto">
            {
                flowerCards.map((card, i) => {
                        return (
                            <NurseryModal
                                flowerCard = {
                                    <FlowerCard
                                        id={i}
                                        label={card.label}
                                        description={card.description}
                                        selected={i === selectedCard}
                                        onClick={selectCard}
                                    />
                                }
                            />
                        )
                })
            }
        </Grid>
    </>)
};

export default MyceliumGrid;