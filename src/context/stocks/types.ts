export interface Stock {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  color?: string;
}

export interface StocksState {
  items: Stock[];
  loading: boolean;
  error: string | null;
}
