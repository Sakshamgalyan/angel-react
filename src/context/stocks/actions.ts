import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStocksApi } from './api';

export const fetchStocks = createAsyncThunk(
  'stocks/fetchStocks',
  async () => {
    const response = await fetchStocksApi();
    return response;
  }
);
