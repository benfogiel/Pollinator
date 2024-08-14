import React, { FC } from "react";
import * as RadixSlider from "@radix-ui/react-slider";

export interface SliderProps {
    name: string;
    value: number[];
    onChange?: (value: number[]) => void;
}

const Slider: FC<SliderProps> = (props) => {
    return (
        <div className="SliderContainer">
            <label className="SliderLabel">{props.name}</label>
            <RadixSlider.Root
                name={props.name}
                value={props.value}
                className="SliderRoot"
                defaultValue={[50]}
                max={100}
                step={1}
                onValueChange={props.onChange}
            >
                <RadixSlider.Track className="SliderTrack">
                    <RadixSlider.Range className="SliderRange" />
                </RadixSlider.Track>
                <RadixSlider.Thumb
                    className="SliderThumb"
                    aria-label={props.name}
                />
            </RadixSlider.Root>
        </div>
    );
};

export default Slider;
