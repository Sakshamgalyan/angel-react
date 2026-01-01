"use client"

import { useState } from "react"
import DatePicker from "../ui/DatePicker"
import DropDown from "../ui/DropDown"
import Input from "../ui/Input"
import Button from "../ui/Button"
import { StrategyDropDownOptions, TimeFrameDropDownOptions } from "./constants"
import { Checkbox } from "../ui/Checkbox"
import { API_BASE_URL } from "@/lib/constants"

const AnalyzeCard = () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [symbol, setSymbol] = useState("");
    const [interval, setInterval] = useState("");
    const [strategy, setStrategy] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [technical, setTechnical] = useState(false)
    const [news, setNews] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        if (!symbol) {
            setError("Please enter a symbol");
            return;
        }
        if (!interval) {
            setError("Please select a timeframe");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol: symbol,
                    timeframe: interval,
                    data_time: startDate || undefined,
                    technicals: technical,
                    fundamentals: false,
                    news: news,
                })
            })

            if (response.status === 403) {
                // Account locked - force reload to trigger middleware redirect
                window.location.reload();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch analysis');
            }

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${symbol}_${interval}_analysis.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error('Error downloading file:', error);
            setError(error.message || "An error occurred during analysis");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900">
                    Market Analysis
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Configure your strategy parameters
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Symbol Name"
                    placeholder="e.g. RELIANCE"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                />

                <DropDown
                    label="Timeframe"
                    placeholder="Select timeframe"
                    options={TimeFrameDropDownOptions}
                    value={interval}
                    onChange={(opt) => setInterval(opt.value as string)}
                />

                <DatePicker
                    label="Date"
                    placeholder="Pick a date"
                    value={startDate}
                    onChange={setStartDate}
                    showTime={true}
                />

                <DropDown
                    label="Strategy"
                    placeholder="Select strategy"
                    options={StrategyDropDownOptions}
                    value={strategy}
                    onChange={(opt) => setStrategy(opt.value as string)}
                />
            </div>

            <div className="mt-6 flex flex-row gap-6">
                <Checkbox
                    label="Include Technical Indicators"
                    checked={technical}
                    onChange={(e) => setTechnical(e.target.checked)}
                />
                <Checkbox
                    label="Include News"
                    checked={news}
                    onChange={(e) => setNews(e.target.checked)}
                />
            </div>

            {error && (
                <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                </div>
            )}

            <div className="mt-8">
                <Button onClick={handleSubmit} className="w-full py-2.5 text-base">
                    {isLoading ? "Loading..." : "Run Analysis"}
                </Button>
            </div>
        </div>
    )
}

export default AnalyzeCard