import React, { FC } from "react";

export interface SectionSeparatorProps {
    text: string;
}

const SectionSeparator: FC<SectionSeparatorProps> = (props) => {
    return (
        <div className="separator-container">
            <div className="line"></div>
            <span className="separator-text">{props.text}</span>
            <div className="line"></div>
        </div>
    );
};

export default SectionSeparator;
