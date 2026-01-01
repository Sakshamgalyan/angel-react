import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: StocksState = {
  items: [],
  loading: false,
  error: null,
};

export const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    fetchStocksRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStocksSuccess: (state, action: PayloadAction<Stock[]>) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    fetchStocksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStocksRequest, fetchStocksSuccess, fetchStocksFailure } = stocksSlice.actions;

export default stocksSlice.reducer;
