import { configureStore } from '@reduxjs/toolkit';
import { stocksReducer } from '../context/stocks/reducer';
import { themeReducer } from '../context/theme/reducer';

export const store = configureStore({
  reducer: {
    stocks: stocksReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
