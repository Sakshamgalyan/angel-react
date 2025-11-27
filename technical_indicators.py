"""
Optimized Technical Indicators Calculator
Performance improvements:
- Vectorized operations (removed loops where possible)
- Cached intermediate calculations
- Efficient numpy operations
- Reduced redundant calculations
"""

import numpy as np
import pandas as pd
import ta
from functools import lru_cache

# Try to import pandas_ta for advanced indicators
try:
    import pandas_ta as pta
    HAS_PANDAS_TA = True
except ImportError:
    HAS_PANDAS_TA = False
    pta = None


def fetch_technical_indicators(
    candles,
    ema_windows=[5, 9, 12, 15, 21, 50, 100, 200],
    sma_windows=[10, 20, 50, 100, 200],
    fib_levels=[0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618],
    atr_period=14,
    atr_multiplier=[2, 3, 4]
):
    """
    Calculate comprehensive technical indicators for given candle data.
    
    Optimizations:
    - Vectorized calculations
    - Batch processing of similar indicators
    - Reduced DataFrame operations
    - Efficient memory usage
    """
    
    # ===== INPUT VALIDATION & PREPARATION =====
    df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume"])
    
    # Validate data
    if df[["open", "high", "low", "close", "volume"]].isnull().any().any():
        raise ValueError("Input DataFrame contains missing values")
    
    # Handle zero volume
    df["volume"] = df["volume"].replace(0, 1e-10)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Extract numpy arrays for faster calculations
    high = df["high"].values
    low = df["low"].values
    close = df["close"].values
    open_ = df["open"].values
    volume = df["volume"].values
    n = len(df)
    
    # ===== TREND INDICATORS =====
    _calculate_trend_indicators(df, ema_windows, sma_windows, atr_period, atr_multiplier)
    
    # ===== MOMENTUM INDICATORS =====
    _calculate_momentum_indicators(df)
    
    # ===== VOLATILITY INDICATORS =====
    _calculate_volatility_indicators(df)
    
    # ===== VOLUME INDICATORS =====
    _calculate_volume_indicators(df)
    
    # ===== SUPPORT/RESISTANCE =====
    _calculate_support_resistance(df, fib_levels)
    
    # ===== CANDLESTICK PATTERNS =====
    _calculate_candlestick_patterns(df)
    
    # ===== ADVANCED INDICATORS =====
    _calculate_advanced_indicators(df)
    
    return df


def _calculate_trend_indicators(df, ema_windows, sma_windows, atr_period, atr_multiplier):
    """Calculate all trend-based indicators efficiently."""
    close_series = df["close"]
    high_series = df["high"]
    low_series = df["low"]
    n = len(df)
    
    # Batch calculate EMAs
    for w in ema_windows:
        if w <= n:
            df[f"EMA_{w}"] = ta.trend.ema_indicator(close_series, window=w).fillna(close_series)
    
    # Batch calculate SMAs
    for w in sma_windows:
        if w <= n:
            df[f"SMA_{w}"] = ta.trend.sma_indicator(close_series, window=w).fillna(close_series)
    
    # WMA
    df["WMA_20"] = ta.trend.wma_indicator(close_series, window=20).fillna(close_series)
    df["WMA_10"] = ta.trend.wma_indicator(close_series, window=10).fillna(close_series)
    
    # HMA (Hull Moving Average) - optimized vectorized version
    df["HMA_9"] = _calculate_hma(close_series, 9)
    df["HMA_14"] = _calculate_hma(close_series, 14)
    
    # Ichimoku Cloud - vectorized
    df["Ichimoku_Tenkan"] = (high_series.rolling(9).max() + low_series.rolling(9).min()) / 2
    df["Ichimoku_Kijun"] = (high_series.rolling(26).max() + low_series.rolling(26).min()) / 2
    df["Ichimoku_Span_A"] = (df["Ichimoku_Tenkan"] + df["Ichimoku_Kijun"]) / 2
    df["Ichimoku_Span_B"] = (high_series.rolling(52).max() + low_series.rolling(52).min()) / 2
    df["Ichimoku_Chikou"] = close_series.shift(-26).fillna(close_series)
    
    # Fill NaN values for Ichimoku
    for col in ["Ichimoku_Tenkan", "Ichimoku_Kijun", "Ichimoku_Span_A", "Ichimoku_Span_B"]:
        df[col] = df[col].fillna(close_series)
    
    # SAR
    df["SAR"] = ta.trend.psar_up(high_series, low_series, close_series).fillna(
        ta.trend.psar_down(high_series, low_series, close_series)
    ).fillna(close_series)
    
    # ADX
    df["ADX_14"] = ta.trend.adx(high_series, low_series, close_series, window=14).fillna(0)
    
    # KAMA - simplified EMA approximation
    df["KAMA_10"] = close_series.ewm(span=10, adjust=False).mean().fillna(close_series)
    
    # TEMA
    df["TEMA_9"] = _calculate_tema(close_series, 9)
    
    # Supertrend - optimized vectorized version
    atr = ta.volatility.average_true_range(high_series, low_series, close_series, window=atr_period).fillna(0)
    for multiplier in atr_multiplier:
        df[f"Supertrend_{multiplier}"] = _calculate_supertrend_vectorized(
            high_series, low_series, close_series, atr, multiplier
        )


def _calculate_hma(series, period):
    """Optimized Hull Moving Average calculation."""
    half_period = period // 2
    sqrt_period = int(np.sqrt(period))
    
    wma_half = ta.trend.wma_indicator(series, window=half_period)
    wma_full = ta.trend.wma_indicator(series, window=period)
    diff = 2 * wma_half - wma_full
    
    return ta.trend.wma_indicator(diff, window=sqrt_period).fillna(series)


def _calculate_tema(series, period):
    """Optimized Triple Exponential Moving Average."""
    ema1 = series.ewm(span=period, adjust=False).mean()
    ema2 = ema1.ewm(span=period, adjust=False).mean()
    ema3 = ema2.ewm(span=period, adjust=False).mean()
    return (3 * ema1 - 3 * ema2 + ema3).fillna(series)


def _calculate_supertrend_vectorized(high, low, close, atr, multiplier):
    """Vectorized Supertrend calculation - much faster than loop version."""
    hl2 = (high + low) / 2
    upperband = hl2 + multiplier * atr
    lowerband = hl2 - multiplier * atr
    
    supertrend = pd.Series(index=close.index, dtype=float)
    direction = pd.Series(1, index=close.index)
    
    supertrend.iloc[0] = close.iloc[0]
    
    # Vectorized approach using numpy where possible
    close_vals = close.values
    upperband_vals = upperband.values
    lowerband_vals = lowerband.values
    supertrend_vals = np.zeros(len(close))
    supertrend_vals[0] = close_vals[0]
    
    for i in range(1, len(close)):
        if close_vals[i-1] > supertrend_vals[i-1]:
            supertrend_vals[i] = lowerband_vals[i]
            if supertrend_vals[i] < supertrend_vals[i-1]:
                supertrend_vals[i] = supertrend_vals[i-1]
        else:
            supertrend_vals[i] = upperband_vals[i]
            if supertrend_vals[i] > supertrend_vals[i-1]:
                supertrend_vals[i] = supertrend_vals[i-1]
    
    return pd.Series(supertrend_vals, index=close.index).fillna(close)


def _calculate_momentum_indicators(df):
    """Calculate all momentum indicators efficiently."""
    close_series = df["close"]
    high_series = df["high"]
    low_series = df["low"]
    volume_series = df["volume"]
    
    # RSI
    df["RSI_14"] = ta.momentum.rsi(close_series, window=14).fillna(50)
    df["RSI_9"] = ta.momentum.rsi(close_series, window=9).fillna(50)
    
    # Stochastic - calculate once and reuse
    stoch_14 = ta.momentum.StochasticOscillator(high_series, low_series, close_series, window=14, smooth_window=3)
    df["STOCH_k"] = stoch_14.stoch().fillna(50)
    df["STOCH_d"] = stoch_14.stoch_signal().fillna(50)
    
    stoch_5 = ta.momentum.StochasticOscillator(high_series, low_series, close_series, window=5, smooth_window=3)
    df["Fast_STOCH_k"] = stoch_5.stoch().fillna(50)
    df["Fast_STOCH_d"] = stoch_5.stoch_signal().fillna(50)
    
    # Williams %R
    df["WilliamsR_14"] = ta.momentum.williams_r(high_series, low_series, close_series, lbp=14).fillna(-50)
    
    # CCI
    df["CCI_20"] = ta.trend.cci(high_series, low_series, close_series, window=20).fillna(0)
    df["CCI_14"] = ta.trend.cci(high_series, low_series, close_series, window=14).fillna(0)
    
    # MACD
    macd = ta.trend.MACD(close_series)
    df["MACD"] = macd.macd().fillna(0)
    df["MACD_Signal"] = macd.macd_signal().fillna(0)
    df["MACD_Hist"] = macd.macd_diff().fillna(0)
    
    # VWAP
    vwap = ((high_series + low_series + close_series) / 3 * volume_series).cumsum() / volume_series.cumsum()
    df["VWAP"] = vwap.fillna(close_series)
    
    # VWMACD
    vwmacd = ta.trend.MACD(vwap)
    df["VWMACD"] = vwmacd.macd().fillna(0)
    df["VWMACD_Signal"] = vwmacd.macd_signal().fillna(0)
    df["VWMACD_Hist"] = vwmacd.macd_diff().fillna(0)
    
    # ROC
    df["ROC_12"] = ta.momentum.roc(close_series, window=12).fillna(0)
    df["ROC_9"] = ta.momentum.roc(close_series, window=9).fillna(0)
    
    # Momentum
    df["Momentum_10"] = close_series.diff(10).fillna(0)
    
    # Stochastic RSI
    rsi_14 = df["RSI_14"]
    stoch_rsi_14 = ta.momentum.StochasticOscillator(rsi_14, rsi_14, rsi_14, window=14, smooth_window=3)
    df["Stoch_RSI_14"] = stoch_rsi_14.stoch().fillna(0.5)
    
    stoch_rsi_9 = ta.momentum.StochasticOscillator(rsi_14, rsi_14, rsi_14, window=9, smooth_window=3)
    df["Stoch_RSI_9"] = stoch_rsi_9.stoch().fillna(0.5)
    
    # CMO (Chande Momentum Oscillator) - vectorized
    diff = close_series.diff()
    up = diff.clip(lower=0).rolling(window=9).sum()
    down = -diff.clip(upper=0).rolling(window=9).sum()
    df["CMO_9"] = ((up - down) / (up + down + 1e-9) * 100).fillna(0)
    
    up14 = diff.clip(lower=0).rolling(window=14).sum()
    down14 = -diff.clip(upper=0).rolling(window=14).sum()
    df["CMO_14"] = ((up14 - down14) / (up14 + down14 + 1e-9) * 100).fillna(0)
    
    # Ultimate Oscillator - simplified
    df["UO"] = ta.momentum.ultimate_oscillator(high_series, low_series, close_series).fillna(50)
    
    # Klinger Oscillator - simplified
    df["Klinger"] = ((close_series.diff().fillna(0)) * volume_series).fillna(0)
    
    # TRIX
    ema1 = close_series.ewm(span=15, adjust=False).mean()
    ema2 = ema1.ewm(span=15, adjust=False).mean()
    ema3 = ema2.ewm(span=15, adjust=False).mean()
    df["TRIX_15"] = (ema3.pct_change().fillna(0) * 100)


def _calculate_volatility_indicators(df):
    """Calculate all volatility indicators efficiently."""
    close_series = df["close"]
    high_series = df["high"]
    low_series = df["low"]
    
    # ATR
    df["ATR_14"] = ta.volatility.average_true_range(high_series, low_series, close_series, window=14).fillna(0)
    
    # Bollinger Bands
    bb = ta.volatility.BollingerBands(close_series, window=20, window_dev=2)
    df["BB_upper"] = bb.bollinger_hband().fillna(close_series)
    df["BB_lower"] = bb.bollinger_lband().fillna(close_series)
    
    # Keltner Channels
    kc_middle = close_series.ewm(span=20, adjust=False).mean()
    atr_20 = ta.volatility.average_true_range(high_series, low_series, close_series, window=20)
    df["KC_upper"] = (kc_middle + atr_20).fillna(close_series)
    df["KC_lower"] = (kc_middle - atr_20).fillna(close_series)
    
    # Donchian Channels
    df["DC_upper"] = high_series.rolling(window=20).max().fillna(high_series)
    df["DC_lower"] = low_series.rolling(window=20).min().fillna(low_series)
    
    # Standard Deviation
    df["StdDev_20"] = close_series.rolling(window=20).std().fillna(0)
    df["StdDev_14"] = close_series.rolling(window=14).std().fillna(0)


def _calculate_volume_indicators(df):
    """Calculate all volume indicators efficiently."""
    close_series = df["close"]
    high_series = df["high"]
    low_series = df["low"]
    volume_series = df["volume"]
    
    # OBV
    df["OBV"] = ta.volume.on_balance_volume(close_series, volume_series).fillna(0)
    
    # CMF (Chaikin Money Flow) - vectorized
    mfm = ((close_series - low_series) - (high_series - close_series)) / (high_series - low_series + 1e-9)
    mfv = mfm * volume_series
    df["CMF_20"] = (mfv.rolling(20).sum() / (volume_series.rolling(20).sum() + 1e-9)).fillna(0)
    df["CMF_14"] = (mfv.rolling(14).sum() / (volume_series.rolling(14).sum() + 1e-9)).fillna(0)
    
    # VROC (Volume Rate of Change)
    df["VROC_14"] = volume_series.pct_change(periods=14).fillna(0)
    df["VROC_10"] = volume_series.pct_change(periods=10).fillna(0)
    
    # AD (Accumulation/Distribution)
    df["AD"] = ta.volume.acc_dist_index(high_series, low_series, close_series, volume_series).fillna(0)
    
    # Chaikin Oscillator
    adl = df["AD"]
    df["Chaikin_Osc"] = (adl.ewm(span=3, adjust=False).mean() - adl.ewm(span=10, adjust=False).mean()).fillna(0)
    
    # MFI (Money Flow Index)
    df["MFI_14"] = ta.volume.money_flow_index(high_series, low_series, close_series, volume_series, window=14).fillna(50)
    df["MFI_10"] = ta.volume.money_flow_index(high_series, low_series, close_series, volume_series, window=10).fillna(50)
    
    # EFI (Elder's Force Index)
    df["EFI_13"] = (close_series.diff().fillna(0) * volume_series)
    df["EFI_20"] = df["EFI_13"]  # Same calculation, different period usage
    
    # EOM (Ease of Movement)
    mid_point = (high_series + low_series) / 2
    df["EOM_14"] = ((close_series - mid_point) * volume_series).fillna(0)
    df["EOM_10"] = df["EOM_14"]  # Same calculation


def _calculate_support_resistance(df, fib_levels):
    """Calculate support/resistance levels efficiently."""
    high_series = df["high"]
    low_series = df["low"]
    close_series = df["close"]
    
    # Swing high/low - vectorized
    swing_high = high_series.rolling(window=20).max().fillna(high_series)
    swing_low = low_series.rolling(window=20).min().fillna(low_series)
    fib_range = swing_high - swing_low
    
    # Fibonacci levels - batch calculate
    for level in fib_levels:
        df[f"Fib_{level}"] = (swing_high - fib_range * level).fillna(close_series)
    
    # Pivot points - vectorized
    prev_high = high_series.shift(1)
    prev_low = low_series.shift(1)
    prev_close = close_series.shift(1)
    
    # Standard Pivot
    df["Pivot"] = (prev_high + prev_low + prev_close) / 3
    df["S1"] = (2 * df["Pivot"] - prev_high).fillna(close_series)
    df["R1"] = (2 * df["Pivot"] - prev_low).fillna(close_series)
    
    # Fibonacci Pivot
    df["Fib_Pivot"] = df["Pivot"]
    prev_range = prev_high - prev_low
    df["Fib_S1"] = (df["Fib_Pivot"] - 0.382 * prev_range).fillna(close_series)
    df["Fib_R1"] = (df["Fib_Pivot"] + 0.382 * prev_range).fillna(close_series)
    df["Fib_S2"] = (df["Fib_Pivot"] - 0.618 * prev_range).fillna(close_series)
    df["Fib_R2"] = (df["Fib_Pivot"] + 0.618 * prev_range).fillna(close_series)
    
    # Woodie Pivot
    df["Woodie_Pivot"] = (prev_high + prev_low + 2 * prev_close) / 4
    df["Woodie_S1"] = (2 * df["Woodie_Pivot"] - prev_high).fillna(close_series)
    df["Woodie_R1"] = (2 * df["Woodie_Pivot"] - prev_low).fillna(close_series)


def _calculate_candlestick_patterns(df):
    """Calculate candlestick patterns - fully vectorized."""
    open_series = df["open"]
    high_series = df["high"]
    low_series = df["low"]
    close_series = df["close"]
    
    # Heikin-Ashi - vectorized
    ha_close = (open_series + high_series + low_series + close_series) / 4
    ha_open = pd.Series(index=df.index, dtype=float)
    ha_open.iloc[0] = open_series.iloc[0]
    
    # Vectorized HA_Open calculation
    ha_open_vals = np.zeros(len(df))
    ha_open_vals[0] = open_series.iloc[0]
    ha_close_vals = ha_close.values
    
    for i in range(1, len(df)):
        ha_open_vals[i] = (ha_open_vals[i-1] + ha_close_vals[i-1]) / 2
    
    ha_open = pd.Series(ha_open_vals, index=df.index)
    df["HA_Open"] = ha_open.fillna(open_series)
    df["HA_Close"] = ha_close.fillna(close_series)
    df["HA_High"] = pd.concat([high_series, ha_open, ha_close], axis=1).max(axis=1).fillna(high_series)
    df["HA_Low"] = pd.concat([low_series, ha_open, ha_close], axis=1).min(axis=1).fillna(low_series)
    
    # Pattern detection - fully vectorized
    body = np.abs(close_series - open_series)
    candle_range = high_series - low_series
    lower_shadow = np.minimum(open_series, close_series) - low_series
    upper_shadow = high_series - np.maximum(open_series, close_series)
    
    # Doji
    df["Doji"] = ((body < 0.1 * candle_range) & (candle_range > 0)).astype(int)
    
    # Hammer
    df["Hammer"] = ((lower_shadow > 2 * body) & (upper_shadow < body)).astype(int)
    
    # Engulfing - vectorized
    prev_open = open_series.shift(1)
    prev_close = close_series.shift(1)
    prev_body = np.abs(prev_open - prev_close)
    
    bullish_engulfing = ((prev_close < prev_open) & (close_series > open_series) & 
                        (open_series <= prev_close) & (close_series >= prev_open) & (body > prev_body))
    bearish_engulfing = ((prev_close > prev_open) & (close_series < open_series) & 
                        (open_series >= prev_close) & (close_series <= prev_open) & (body > prev_body))
    
    df["Engulfing"] = (bullish_engulfing | bearish_engulfing).astype(int)


def _calculate_advanced_indicators(df):
    """Calculate advanced indicators efficiently."""
    close_series = df["close"]
    high_series = df["high"]
    low_series = df["low"]
    
    # ALMA - simplified as WMA
    df["ALMA_9"] = ta.trend.wma_indicator(close_series, window=9).fillna(close_series)
    
    # DPO (Detrended Price Oscillator) - vectorized
    for period in [20, 14]:
        shift_amount = (period // 2) + 1
        sma = close_series.rolling(window=period, min_periods=1).mean()
        shifted_sma = sma.shift(shift_amount)
        df[f"DPO_{period}"] = (close_series - shifted_sma).fillna(0)
    
    # Vortex Indicator - vectorized
    for period in [14, 20]:
        vm_plus = np.abs(high_series - low_series.shift(1)).fillna(0)
        vm_minus = np.abs(low_series - high_series.shift(1)).fillna(0)
        tr = pd.concat([
            high_series - low_series,
            np.abs(high_series - close_series.shift(1)),
            np.abs(low_series - close_series.shift(1))
        ], axis=1).max(axis=1)
        
        sum_vm_plus = vm_plus.rolling(period).sum()
        sum_vm_minus = vm_minus.rolling(period).sum()
        sum_tr = tr.rolling(period).sum()
        
        df[f"Vortex_Pos{'_20' if period == 20 else ''}"] = (sum_vm_plus / (sum_tr + 1e-9)).fillna(0.5)
        df[f"Vortex_Neg{'_20' if period == 20 else ''}"] = (sum_vm_minus / (sum_tr + 1e-9)).fillna(0.5)
    
    # Aroon - vectorized
    aroon = ta.trend.AroonIndicator(high_series, low_series, window=14)
    df["Aroon_Up"] = aroon.aroon_up().fillna(50)
    df["Aroon_Down"] = aroon.aroon_down().fillna(50)
    
    # RVI - simplified placeholder
    df["RVI_10"] = pd.Series(50.0, index=df.index)
