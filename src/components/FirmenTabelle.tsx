import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterPanel from "./FilterPanel";
import RangeSlider from "./RangeSlider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "../assets/LogoBizSelect.png";




type Firma = {
    name: string;
    typ: string;
    region: string;
    umsatz: number;
    branche: string;
    mitarbeiter: number;
    gruendung: number;
};

const FirmenTabelle: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [daten, setDaten] = useState<Firma[]>([]);
    const [filterTyp, setFilterTyp] = useState<string[]>([]); // 🔹 Mehrfachauswahl
    const [filterRegion, setFilterRegion] = useState("Alle");
    const [filterBranche, setFilterBranche] = useState("Alle");
    const [minUmsatz, setMinUmsatz] = useState<number | "">("");
    const [maxUmsatz, setMaxUmsatz] = useState<number | "">("");
    const [mitarbeiterRange, setMitarbeiterRange] = useState<[number, number]>([0, 500]);
    const [gruenderRange, setGruenderRange] = useState<[number, number]>([1980, new Date().getFullYear()]);
    const [sortKey, setSortKey] = useState<keyof Firma | "">("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
      fetch("/demo_firmen.json")
        .then((res) => res.json())
        .then((data) => setDaten(data));
    }, []);


    const firmentypen = Array.from(new Set(daten.map(f => f.typ)));
    const regionen = Array.from(new Set(daten.map(f => f.region)));
    const branchen = Array.from(new Set(daten.map(f => f.branche)));

    const sortierteDaten = [...daten].sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortOrder === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const gefiltert = sortierteDaten.filter(f =>
        (filterTyp.length === 0 || filterTyp.includes(f.typ)) && // 🔹 aktualisiert
        (filterRegion === "Alle" || f.region === filterRegion) &&
        (filterBranche === "Alle" || f.branche === filterBranche) &&
        (minUmsatz === "" || f.umsatz >= minUmsatz) &&
        (maxUmsatz === "" || f.umsatz <= maxUmsatz) &&
        (f.mitarbeiter >= mitarbeiterRange[0] && f.mitarbeiter <= mitarbeiterRange[1]) &&
        (f.gruendung >= gruenderRange[0] && f.gruendung <= gruenderRange[1])

    );

    const resetFilter = () => {
        setFilterTyp([]);
        setFilterRegion("Alle");
        setFilterBranche("Alle");
        setMinUmsatz("");
        setMaxUmsatz("");
        setMitarbeiterRange([0, 500]);
        setGruenderRange([1980, new Date().getFullYear()]);
    };


    const exportExcel = () => {
        const headers = [["Name", "Typ", "Region", "Branche", "Umsatz (€)", "Mitarbeiter", "Gründer"]];
        const data = gefiltert.map(f => [
            f.name,
            f.typ,
            f.region,
            f.branche,
            f.umsatz,
            f.mitarbeiter,
            f.gruendung
        ]);
        const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Firmen");
        XLSX.writeFile(workbook, "firmen.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Firmenübersicht", 10, 10);
        autoTable(doc, {
            startY: 20,
            head: [["Name", "Typ", "Region", "Branche", "Umsatz (€)", "Mitarbeiter", "Gründer"]],
            body: gefiltert.map(f => [
                f.name,
                f.typ,
                f.region,
                f.branche,
                f.umsatz.toLocaleString("de-DE"),
                f.mitarbeiter.toString(),
                f.gruendung.toString()
            ]),
        });
        doc.save("firmen.pdf");
    };

    return (
        <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className={`relative transition-all duration-300 ${sidebarOpen ? "w-72" : "w-6"}`}>
                <div className="absolute -right-3 top-4 z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-blue-600 text-white p-1 rounded-full shadow hover:bg-blue-700"
                    >
                        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                <div className={`${sidebarOpen ? "block" : "hidden"} bg-gray-100 h-full p-4`}>
                    <h2 className="text-lg font-semibold mb-4">Filter</h2>
                    <div className="space-y-4">
                        <FilterPanel
                            label="Firmentyp"
                            selected={filterTyp}
                            options={firmentypen}
                            onChange={setFilterTyp}
                            daten={daten}
                        />

                        <FilterPanel
                            label="Region"
                            selected={filterRegion === "Alle" ? [] : [filterRegion]}
                            options={regionen}
                            onChange={(vals) => setFilterRegion(vals.length === 0 ? "Alle" : vals[0])}
                            daten={daten}
                        />

                        <FilterPanel
                            label="Branche"
                            selected={filterBranche === "Alle" ? [] : [filterBranche]}
                            options={branchen}
                            onChange={(vals) => setFilterBranche(vals.length === 0 ? "Alle" : vals[0])}
                            daten={daten}
                        />


                        <RangeSlider
                            label="Umsatz (€)"
                            min={0}
                            max={10000000}
                            value={[
                                minUmsatz === "" ? 0 : minUmsatz,
                                maxUmsatz === "" ? 10000000 : maxUmsatz
                            ]}
                            onChange={([min, max]: [number, number]) => {
                                setMinUmsatz(min);
                                setMaxUmsatz(max);
                            }}
                        />

                        <RangeSlider
                            label="Mitarbeiter"
                            min={0}
                            max={500}
                            value={mitarbeiterRange}
                            onChange={(r) => setMitarbeiterRange(r)}
                        />

                        <RangeSlider
                            label="Gründerjahr"
                            min={1980}
                            max={new Date().getFullYear()}
                            value={gruenderRange}
                            onChange={(r) => setGruenderRange(r)}
                        />

                        <button
                            onClick={resetFilter}
                            className="w-full mt-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Zurücksetzen
                        </button>
                    </div>
                </div>
            </div>

            {/* Hauptinhalt */}
            <div className="flex-1 p-4">
                {/* Kopfzeile mit Logo & Titel */}
                {/* Neuer Kopfbereich */}
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold mt-2">Firmenübersicht</h1>

                    <div className="flex flex-col items-end gap-2">
                        <img
                            src={Logo}
                            alt="BizSelect Logo"
                            className="h-16 w-auto drop-shadow-md"
                        />
                        <select
                            onChange={e => {
                                if (e.target.value === "excel") exportExcel();
                                if (e.target.value === "pdf") exportPDF();
                                e.target.selectedIndex = 0;
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                            defaultValue=""
                        >
                            <option value="" disabled>Exportieren</option>
                            <option value="excel">Excel</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                </div>

                {/* Tabelle */}
                <table className="w-full table-auto border-collapse">
                    <thead>
                    <tr>
                        {["name", "typ", "region", "branche", "umsatz", "mitarbeiter", "gruendung"].map((key) => (
                            <th
                                key={key}
                                onClick={() => {
                                    if (sortKey === key) {
                                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    } else {
                                        setSortKey(key as keyof Firma);
                                        setSortOrder("asc");
                                    }
                                }}
                                className="cursor-pointer text-left border-b py-2"
                            >
                                {key === "gruendung" ? "Gründer" : key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                                {sortKey === key && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {gefiltert.map((f, index) => (
                        <tr key={index} className="border-b hover:bg-gray-100">
                            <td className="py-2">{f.name}</td>
                            <td>{f.typ}</td>
                            <td>{f.region}</td>
                            <td>{f.branche}</td>
                            <td>{f.umsatz.toLocaleString("de-DE")} €</td>
                            <td>{f.mitarbeiter}</td>
                            <td>{f.gruendung}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 👇 Alle anderen UI-Komponenten wie vorher

const Dropdown = ({
                      label,
                      value,
                      options,
                      onChange,
                  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}) => (
    <label>
        <span className="mr-2 font-medium">{label}:</span>
        <select value={value} onChange={e => onChange(e.target.value)} className="p-1 border rounded">
            <option value="Alle">Alle</option>
            {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </label>
);

const NumberInput = ({
                         label,
                         value,
                         onChange,
                     }: {
    label: string;
    value: number | "";
    onChange: (val: number | "") => void;
}) => (
    <label>
        <span className="mr-2 font-medium">{label}:</span>
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="p-1 border rounded w-24"
        />
    </label>
);

export default FirmenTabelle;
