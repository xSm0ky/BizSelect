import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

type RangeSliderProps = {
    label: string;
    min: number;
    max: number;
    value: [number, number];
    onChange: (val: [number, number]) => void;
};

const RangeSlider: React.FC<RangeSliderProps> = ({ label, min, max, value, onChange }) => {
    const handleInput = (index: number, newValue: number) => {
        const clamped = Math.max(min, Math.min(max, newValue));
        const updated = [...value] as [number, number];
        updated[index] = clamped;
        if (updated[0] > updated[1]) {
            updated[1 - index] = clamped;
        }
        onChange(updated);
    };

    return (
        <div className="p-3 bg-gray-100 rounded shadow-sm min-w-[280px]">
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm">{label}</h4>
                <span className="text-xs text-gray-600">{value[0].toLocaleString()} – {value[1].toLocaleString()}</span>
            </div>
            <Slider
                range
                min={min}
                max={max}
                value={value}
                onChange={(val) => onChange(val as [number, number])}
                trackStyle={[{ backgroundColor: "#3b82f6" }]}
                handleStyle={[{ borderColor: "#3b82f6" }, { borderColor: "#3b82f6" }]}
            />
            <div className="flex justify-between mt-2 gap-2">
                <input
                    type="number"
                    className="w-20 p-1 border rounded text-sm"
                    value={value[0]}
                    onChange={(e) => handleInput(0, parseInt(e.target.value) || min)}
                />
                <input
                    type="number"
                    className="w-20 p-1 border rounded text-sm"
                    value={value[1]}
                    onChange={(e) => handleInput(1, parseInt(e.target.value) || max)}
                />
            </div>
        </div>
    );
};

export default RangeSlider;
