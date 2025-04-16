import React from "react";

type Firma = {
    name: string;
    typ: string;
    region: string;
    branche: string;
    umsatz: number;
    mitarbeiter: number;
    gruendung: number;
};

type FilterPanelProps = {
    label: string;
    selected: string[];
    options: string[];
    onChange: (val: string[]) => void;
    daten: Firma[];
};

const FilterPanel: React.FC<FilterPanelProps> = ({ label, selected, options, onChange, daten }) => {
    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const reset = () => onChange([]);
    const selectAll = () => onChange(options);

    return (
        <div className="bg-gray-100 p-3 rounded-md shadow-sm min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">{label}</h4>
                <div className="text-sm text-blue-600 space-x-2">
                    <button onClick={selectAll} className="hover:underline">Alle</button>
                    <button onClick={reset} className="hover:underline">Zurücksetzen</button>
                </div>
            </div>
            <ul className="max-h-52 overflow-auto space-y-1">
                {options.map((opt, i) => {
                    const count = daten.filter(f =>
                        label === "Firmentyp"
                            ? f.typ === opt
                            : label === "Region"
                                ? f.region === opt
                                : label === "Branche"
                                    ? f.branche === opt
                                    : false
                    ).length;

                    return (
                        <li key={i} className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt)}
                                    onChange={() => toggleOption(opt)}
                                />
                                <span>{opt}</span>
                            </label>
                            <span className="text-xs text-gray-500">({count})</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FilterPanel;
