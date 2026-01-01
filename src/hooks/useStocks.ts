import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './storeHooks';
import { fetchStocksRequest } from '../store/slices/stocksSlice';

export const useStocks = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.stocks);

  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      dispatch(fetchStocksRequest());
    }
  }, [dispatch, items.length, loading, error]);

  return { stocks: items, loading, error };
};
