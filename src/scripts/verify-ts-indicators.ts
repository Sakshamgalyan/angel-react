
import { fetchTechnicalIndicators } from '../lib/technical-indicators';

const mockCandles = [
  // time, open, high, low, close, volume
  ["2023-01-01 09:15", 100, 105, 95, 102, 1000],
  ["2023-01-01 09:16", 102, 108, 101, 107, 1500],
  ["2023-01-01 09:17", 107, 110, 105, 105, 1200],
  ["2023-01-01 09:18", 105, 106, 100, 101, 800],
  ["2023-01-01 09:19", 101, 103, 98, 99, 1100],
  ["2023-01-01 09:20", 99, 102, 98, 100, 1300],
  // ... adding more to ensure indicators calculate (period 14 etc)
];

// Generate more data
for(let i=0; i<50; i++) {
    const last = mockCandles[mockCandles.length-1];
    const base = last[4] as number;
    mockCandles.push([
        `2023-01-01 09:${21+i}`, 
        base, base+2, base-2, base+1, 1000+i*10
    ]);
}

try {
    console.log("Running Technical Indicators Calculation...");
    const result = fetchTechnicalIndicators(mockCandles);
    console.log("Calculation Successful!");
    console.log("Key Results:");
    console.log("RSI 14:", result.RSI_14);
    console.log("EMA 9:", result.EMA_9);
    console.log("Supertrend 3:", result.Supertrend_3);
    console.log("MACD:", result.MACD);
} catch (e) {
    console.error("Error:", e);
}
