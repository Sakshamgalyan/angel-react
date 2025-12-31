import { useAppDispatch, useAppSelector } from './storeHooks';
import { toggleTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const toggle = () => {
    dispatch(toggleTheme());
  };

  return { theme, toggle };
};
