import React, { FC } from "react";
import { Card as RadixCard, Text } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
    numPickers: number;
}

export const ColorPicker: FC<ColorPickerProps> = ({ numPickers }) => {
    const pickerArray = Array.from({ length: numPickers }, (_, i) => i + 1);

    const handlePickerClick = (event) => {
        event.stopPropagation();
        setCustomGradPicker(true);
    };

    return (
        <div onClick={handlePickerClick} style={{ position: "absolute" }}>
            {pickerArray.map((_) => {
                return (
                    <HexColorPicker
                        color={customGrad1}
                        onChange={setCustomGrad1}
                        style={{
                            position: "absolute",
                            marginTop: "75px",
                        }}
                    />
                );
            })}
        </div>
    );
};
