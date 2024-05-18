import { FC, useState } from 'react';
import '@radix-ui/themes/styles.css';
import { Grid } from '@radix-ui/themes';
import { isMobile } from 'react-device-detect';
import { v4 as uuid } from 'uuid';

import { Flower } from "../../interfaces/interfaces"
import FlowerCard from './FlowerCard';
import NurseryModal from './NurseryModal';

interface MyceliumGridProps {
    flowers: Record<string, Flower>;
    setFlowers: (flowers: Record<string, Flower>) => void;
}

const MyceliumGrid: FC<MyceliumGridProps> = ({flowers, setFlowers}) => {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const selectCard = (id: string) => {
        setSelectedCard(id);
    };

    const updateFlower = (flower: Flower) => {
        flowers[flower.id] = flower;
        setFlowers({...flowers});
    };

    return (<>
        <Grid columns={isMobile ? "2" : "3"} gap="5" rows="repeat(0, 200px)" width="auto">
            {
                Object.keys(flowers).map((id) => {
                    return (
                        <NurseryModal
                            flowerCard={
                                <FlowerCard
                                    id={id}
                                    flowerParams={flowers[id]}
                                    selected={id === selectedCard}
                                    onClick={selectCard}
                                />
                            }
                            updateFlower={updateFlower}
                        />
                    )
                })
            }
            {
                <NurseryModal
                    flowerCard={
                        <FlowerCard
                            id={uuid()}
                            onClick={selectCard}
                        />
                    }
                    updateFlower={updateFlower}
                />
            }
        </Grid>
    </>)
};

export default MyceliumGrid;