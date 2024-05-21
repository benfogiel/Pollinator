import React, { FC } from "react";

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    setValue: (value: string) => void;
    type?: string;
    required?: boolean;
}

const InputField: FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    setValue,
    type,
    required = true,
}) => (
    <div>
        <label className="block text-sm text-pol-text-1 font-bold mb-1">
            {label}
        </label>
        <input
            type={type}
            style={{ backgroundColor: "transparent" }}
            className="block w-full px-3 py-2 border border-pol-border-1 rounded focus:outline-none focus:ring focus:ring-red-500 text-pol-text-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            required={required}
        />
    </div>
);

export default InputField;
