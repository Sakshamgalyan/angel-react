import { Stock } from '../store/slices/stocksSlice';

const MOCK_STOCKS: Stock[] = [
  { name: "Apple Inc.", symbol: "AAPL", price: "$172.25", change: "1.25%", isPositive: true, color: "bg-gray-200 text-black" },
  { name: "Google LLC", symbol: "GOOGL", price: "$139.41", change: "-0.75%", isPositive: false, color: "bg-blue-900" },
  { name: "Amazon.com, Inc.", symbol: "AMZN", price: "$127.14", change: "2.10%", isPositive: true, color: "bg-yellow-900" },
  { name: "Tesla, Inc.", symbol: "TSLA", price: "$256.49", change: "5.60%", isPositive: true, color: "bg-red-900" },
  { name: "Microsoft Corp.", symbol: "MSFT", price: "$331.40", change: "-0.20%", isPositive: false, color: "bg-cyan-900" },
  { name: "NVIDIA Corp.", symbol: "NVDA", price: "$460.18", change: "3.45%", isPositive: true, color: "bg-green-900" },
];

export const fetchStocksApi = async (): Promise<Stock[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STOCKS);
    }, 1000);
  });
};
