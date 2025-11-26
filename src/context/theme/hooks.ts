import { useAppDispatch, useAppSelector } from '../../context/stocks/hooks'; // Reusing typed hooks
import { toggleTheme } from './reducer';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const toggle = () => {
    dispatch(toggleTheme());
  };

  return { theme, toggle };
};
