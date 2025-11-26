import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchStocks } from './actions';
import { useEffect } from 'react';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useStocks = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.stocks);

  useEffect(() => {
    if (items.length === 0 && !loading) {
      dispatch(fetchStocks());
    }
  }, [dispatch, items.length, loading]);

  return { stocks: items, loading, error };
};
