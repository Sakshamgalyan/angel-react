import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import themeReducer from './slices/themeSlice';
import stocksReducer from './slices/stocksSlice';
import authReducer from './slices/authSlice';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    stocks: stocksReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
