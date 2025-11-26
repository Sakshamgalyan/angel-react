import { createSlice } from '@reduxjs/toolkit';
import { StocksState } from './types';
import { fetchStocks } from './actions';

const initialState: StocksState = {
  items: [],
  loading: false,
  error: null,
};

export const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stocks';
      });
  },
});

export const stocksReducer = stocksSlice.reducer;
