import numpy as np
import pandas as pd
import ta
import pandas_ta as pta

def fetch_technical_indicators(candles, ema_windows=[5, 9, 12, 15, 21, 50, 100, 200], sma_windows=[10, 20, 50, 100, 200], 
                              fib_levels=[0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618], atr_period=14, atr_multiplier=[2, 3, 4]):
    # Validate input
    df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume"])
    if df[["open", "high", "low", "close", "volume"]].isnull().any().any():
        raise ValueError("Input DataFrame contains missing values")
    if (df["volume"] == 0).any():
        df["volume"] = df["volume"].replace(0, 1e-10)  # Avoid division by zero
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # --- Trend Indicators ---
    max_window = len(df)
    for w in ema_windows:
        if w <= max_window:
            df[f"EMA_{w}"] = ta.trend.ema_indicator(df["close"], window=w).fillna(df["close"])
    for w in sma_windows:
        if w <= max_window:
            df[f"SMA_{w}"] = ta.trend.sma_indicator(df["close"], window=w).fillna(df["close"])
    df["WMA_20"] = ta.trend.wma_indicator(df["close"], window=20).fillna(df["close"])
    df["WMA_10"] = ta.trend.wma_indicator(df["close"], window=10).fillna(df["close"])
    df["HMA_9"] = pta.hma(df["close"], length=9).fillna(df["close"])
    df["HMA_14"] = pta.hma(df["close"], length=14).fillna(df["close"])
    ichimoku = ta.trend.IchimokuIndicator(
        high=df["high"],
        low=df["low"],
        window1=9,
        window2=26,
        window3=52)
    df["Ichimoku_Tenkan"] = ichimoku.ichimoku_conversion_line().fillna(df["close"])
    df["Ichimoku_Kijun"] = ichimoku.ichimoku_base_line().fillna(df["close"])
    df["Ichimoku_Span_A"] = ichimoku.ichimoku_a().fillna(df["close"])
    df["Ichimoku_Span_B"] = ichimoku.ichimoku_b().fillna(df["close"])
    df["Ichimoku_Chikou"] = df["close"].shift(-26).fillna(df["close"])
    df["SAR"] = ta.trend.psar_up(df["high"], df["low"], df["close"]).fillna(ta.trend.psar_down(df["high"], df["low"], df["close"])).fillna(df["close"])
    df["ADX_14"] = ta.trend.adx(df["high"], df["low"], df["close"], window=14).fillna(0)
    kama_indicator = pta.kama(df["close"], length=10, fast=2, slow=30)
    df["KAMA_10"] = kama_indicator.fillna(df["close"])
    df["TEMA_9"] = pta.tema(df["close"], length=9).fillna(df["close"])
    
    def supertrend(df, atr_period, multiplier):
        atr = pta.atr(df["high"], df["low"], df["close"], length=atr_period).fillna(0)
        hl2 = (df["high"] + df["low"]) / 2
        upperband = hl2 + (multiplier * atr)
        lowerband = hl2 - (multiplier * atr)
        supertrend = pd.Series(0.0, index=df.index)
        direction = pd.Series(1, index=df.index)
        for i in range(1, len(df)):
            if df["close"].iloc[i-1] > supertrend.iloc[i-1]:
                supertrend.iloc[i] = lowerband.iloc[i]
                direction.iloc[i] = 1
            else:
                supertrend.iloc[i] = upperband.iloc[i]
                direction.iloc[i] = -1
            if direction.iloc[i] == 1 and supertrend.iloc[i] < supertrend.iloc[i-1]:
                supertrend.iloc[i] = supertrend.iloc[i-1]
            elif direction.iloc[i] == -1 and supertrend.iloc[i] > supertrend.iloc[i-1]:
                supertrend.iloc[i] = supertrend.iloc[i-1]
        return supertrend.fillna(df["close"])
    for m in atr_multiplier:
        df[f"Supertrend_{m}"] = supertrend(df, atr_period, m)
    
    # --- Momentum Indicators ---
    df["RSI_14"] = pta.rsi(df["close"], length=14).fillna(50)
    df["RSI_9"] = pta.rsi(df["close"], length=9).fillna(50)
    stoch_result = pta.stoch(df["high"], df["low"], df["close"], k=14, d=3)
    df["STOCH_k"] = stoch_result.iloc[:, 0].fillna(50) if stoch_result is not None else pd.Series(50, index=df.index)
    df["STOCH_d"] = stoch_result.iloc[:, 1].fillna(50) if stoch_result is not None else pd.Series(50, index=df.index)
    fast_stoch_result = pta.stoch(df["high"], df["low"], df["close"], k=5, d=3)
    df["Fast_STOCH_k"] = fast_stoch_result.iloc[:, 0].fillna(50) if fast_stoch_result is not None else pd.Series(50, index=df.index)
    df["Fast_STOCH_d"] = fast_stoch_result.iloc[:, 1].fillna(50) if fast_stoch_result is not None else pd.Series(50, index=df.index)
    df["WilliamsR_14"] = pta.willr(df["high"], df["low"], df["close"], length=14).fillna(-50)
    df["CCI_20"] = pta.cci(df["high"], df["low"], df["close"], length=20).fillna(0)
    df["CCI_14"] = pta.cci(df["high"], df["low"], df["close"], length=14).fillna(0)
    macd = pta.macd(df["close"])
    df["MACD"] = macd.iloc[:, 0].fillna(0) if macd is not None else pd.Series(0, index=df.index)
    df["MACD_Signal"] = macd.iloc[:, 1].fillna(0) if macd is not None else pd.Series(0, index=df.index)
    df["MACD_Hist"] = macd.iloc[:, 2].fillna(0) if macd is not None else pd.Series(0, index=df.index)
    vwap = ((df["high"] + df["low"] + df["close"]) / 3 * df["volume"]).cumsum() / df["volume"].cumsum()
    vwap_macd = pta.macd(vwap)
    df["VWMACD"] = vwap_macd.iloc[:, 0].fillna(0) if vwap_macd is not None else pd.Series(0, index=df.index)
    df["VWMACD_Signal"] = vwap_macd.iloc[:, 1].fillna(0) if vwap_macd is not None else pd.Series(0, index=df.index)
    df["VWMACD_Hist"] = vwap_macd.iloc[:, 2].fillna(0) if vwap_macd is not None else pd.Series(0, index=df.index)
    df["ROC_12"] = pta.roc(df["close"], length=12).fillna(0)
    df["ROC_9"] = pta.roc(df["close"], length=9).fillna(0)
    df["Momentum_10"] = pta.mom(df["close"], length=10).fillna(0)
    stochrsi_14 = pta.stochrsi(df["close"], length=14)
    df["Stoch_RSI_14"] = stochrsi_14.iloc[:, 0].fillna(0.5) if stochrsi_14 is not None else pd.Series(0.5, index=df.index)
    stochrsi_9 = pta.stochrsi(df["close"], length=9)
    df["Stoch_RSI_9"] = stochrsi_9.iloc[:, 0].fillna(0.5) if stochrsi_9 is not None else pd.Series(0.5, index=df.index)
    df["CMO_9"] = pta.cmo(df["close"], length=9).fillna(0)
    df["CMO_14"] = pta.cmo(df["close"], length=14).fillna(0)
    df["UO"] = pta.uo(df["high"], df["low"], df["close"], fast=7, medium=14, slow=28).fillna(50)
    klinger = pta.kvo(df["high"], df["low"], df["close"], df["volume"], short=34, long=55)
    df["Klinger"] = klinger.iloc[:, 0].fillna(0) if klinger is not None else pd.Series(0, index=df.index)
    trix_15 = pta.trix(df["close"], length=15)
    df["TRIX_15"] = (trix_15.iloc[:, 0].fillna(0) * 100) if trix_15 is not None else pd.Series(0, index=df.index)
    
    # --- Volatility Indicators ---
    df["ATR_14"] = pta.atr(df["high"], df["low"], df["close"], length=14).fillna(0)
    bb = pta.bbands(df["close"], length=20, std=2)
    df["BB_upper"] = bb.iloc[:, 2].fillna(df["close"]) if bb is not None else df["close"]
    df["BB_lower"] = bb.iloc[:, 0].fillna(df["close"]) if bb is not None else df["close"]
    kc = pta.kc(df["high"], df["low"], df["close"], length=20)
    df["KC_upper"] = kc.iloc[:, 2].fillna(df["close"]) if kc is not None else df["close"]
    df["KC_lower"] = kc.iloc[:, 0].fillna(df["close"]) if kc is not None else df["close"]
    dc = pta.donchian(df["high"], df["low"], length=20)
    df["DC_upper"] = dc.iloc[:, 2].fillna(df["close"]) if dc is not None else df["close"]
    df["DC_lower"] = dc.iloc[:, 0].fillna(df["close"]) if dc is not None else df["close"]
    df["StdDev_20"] = df["close"].rolling(window=20).std().fillna(0)
    df["StdDev_14"] = df["close"].rolling(window=14).std().fillna(0)
    
    # --- Volume Indicators ---
    df["OBV"] = pta.obv(df["close"], df["volume"]).fillna(0)
    df["CMF_20"] = pta.cmf(df["high"], df["low"], df["close"], df["volume"], length=20).fillna(0)
    df["CMF_14"] = pta.cmf(df["high"], df["low"], df["close"], df["volume"], length=14).fillna(0)
    df["VROC_14"] = pta.roc(df["volume"], length=14).fillna(0)
    df["VROC_10"] = pta.roc(df["volume"], length=10).fillna(0)
    df["AD"] = pta.ad(df["high"], df["low"], df["close"], df["volume"]).fillna(0)
    df["VWAP"] = vwap.fillna(df["close"])
    adl = df["AD"]  # Accumulation/Distribution Line (ADL)
    df["Chaikin_Osc"] = (adl.ewm(span=3, adjust=False).mean() - adl.ewm(span=10, adjust=False).mean()).fillna(0)
    df["MFI_14"] = pta.mfi(df["high"], df["low"], df["close"], df["volume"], length=14).fillna(50)
    df["MFI_10"] = pta.mfi(df["high"], df["low"], df["close"], df["volume"], length=10).fillna(50)
    df["EFI_13"] = pta.efi(df["close"], df["volume"], length=13).fillna(0)
    df["EFI_20"] = pta.efi(df["close"], df["volume"], length=20).fillna(0)
    df["EOM_14"] = pta.eom(df["high"], df["low"], df["close"], df["volume"], length=14).fillna(0)
    df["EOM_10"] = pta.eom(df["high"], df["low"], df["close"], df["volume"], length=10).fillna(0)
    
    # --- Support/Resistance Indicators ---
    swing_high = df["high"].rolling(window=20).max().fillna(df["high"])
    swing_low = df["low"].rolling(window=20).min().fillna(df["low"])
    fib_range = swing_high - swing_low
    for level in fib_levels:
        df[f"Fib_{level}"] = (swing_high - fib_range * level).fillna(df["close"])
    df["Pivot"] = (df["high"].shift(1) + df["low"].shift(1) + df["close"].shift(1)) / 3
    df["S1"] = (2 * df["Pivot"] - df["high"].shift(1)).fillna(df["close"])
    df["R1"] = (2 * df["Pivot"] - df["low"].shift(1)).fillna(df["close"])
    df["Fib_Pivot"] = (df["high"].shift(1) + df["low"].shift(1) + df["close"].shift(1)) / 3
    df["Fib_S1"] = (df["Fib_Pivot"] - 0.382 * (df["high"].shift(1) - df["low"].shift(1))).fillna(df["close"])
    df["Fib_R1"] = (df["Fib_Pivot"] + 0.382 * (df["high"].shift(1) - df["low"].shift(1))).fillna(df["close"])
    df["Fib_S2"] = (df["Fib_Pivot"] - 0.618 * (df["high"].shift(1) - df["low"].shift(1))).fillna(df["close"])
    df["Fib_R2"] = (df["Fib_Pivot"] + 0.618 * (df["high"].shift(1) - df["low"].shift(1))).fillna(df["close"])
    df["Woodie_Pivot"] = (df["high"].shift(1) + df["low"].shift(1) + 2 * df["close"].shift(1)) / 4
    df["Woodie_S1"] = (2 * df["Woodie_Pivot"] - df["high"].shift(1)).fillna(df["close"])
    df["Woodie_R1"] = (2 * df["Woodie_Pivot"] - df["low"].shift(1)).fillna(df["close"])
    
    # --- Candlestick Indicators ---
    ha_close = (df["open"] + df["high"] + df["low"] + df["close"]) / 4
    ha_open = pd.Series(0.0, index=df.index)
    ha_open.iloc[0] = df["open"].iloc[0]
    for i in range(1, len(df)):
        ha_open.iloc[i] = (ha_open.iloc[i-1] + ha_close.iloc[i-1]) / 2
    ha_high = pd.concat([df["high"], ha_open, ha_close], axis=1).max(axis=1)
    ha_low = pd.concat([df["low"], ha_open, ha_close], axis=1).min(axis=1)
    df["HA_Open"] = ha_open.fillna(df["open"])
    df["HA_High"] = ha_high.fillna(df["high"])
    df["HA_Low"] = ha_low.fillna(df["low"])
    df["HA_Close"] = ha_close.fillna(df["close"])
    
    def is_hammer(open_, high, low, close):
        body = abs(close - open_)
        lower_shadow = open_.where(open_ > close, close) - low
        upper_shadow = high - close.where(open_ > close, open_)
        return (lower_shadow > 2 * body) & (upper_shadow < body)
    
    def is_doji(open_, high, low, close):
        body = abs(close - open_)
        candle_range = high - low
        return (body < 0.1 * candle_range) & (candle_range > 0)
    
    def is_engulfing(open_, high, low, close):
        prev_open = open_.shift(1)
        prev_close = close.shift(1)
        prev_body = abs(prev_open - prev_close)
        body = abs(close - open_)
        is_bullish_engulfing = (prev_close < prev_open) & (close > open_) & (open_ <= prev_close) & (close >= prev_open) & (body > prev_body)
        is_bearish_engulfing = (prev_close > prev_open) & (close < open_) & (open_ >= prev_close) & (close <= prev_open) & (body > prev_body)
        return is_bullish_engulfing | is_bearish_engulfing
    
    df["Doji"] = is_doji(df["open"], df["high"], df["low"], df["close"]).astype(int)
    df["Hammer"] = is_hammer(df["open"], df["high"], df["low"], df["close"]).astype(int)
    df["Engulfing"] = is_engulfing(df["open"], df["high"], df["low"], df["close"]).astype(int)
    
    # --- Advanced Indicators ---
    df["ALMA_9"] = pta.alma(df["close"], length=9, sigma=6, offset=0.85).fillna(df["close"])
    def calculate_dpo(close, length):
        shift_amount = (length // 2) + 1
        sma = close.rolling(window=length, min_periods=1).mean()
        shifted_sma = sma.shift(shift_amount)
        dpo = close - shifted_sma
        return dpo.fillna(0)
    df["DPO_20"] = calculate_dpo(df["close"], 20)
    df["DPO_14"] = calculate_dpo(df["close"], 14)
    vortex_14 = pta.vortex(df["high"], df["low"], df["close"], length=14)
    df["Vortex_Pos"] = vortex_14.iloc[:, 0].fillna(0.5) if vortex_14 is not None else pd.Series(0.5, index=df.index)
    df["Vortex_Neg"] = vortex_14.iloc[:, 1].fillna(0.5) if vortex_14 is not None else pd.Series(0.5, index=df.index)
    vortex_20 = pta.vortex(df["high"], df["low"], df["close"], length=20)
    df["Vortex_Pos_20"] = vortex_20.iloc[:, 0].fillna(0.5) if vortex_20 is not None else pd.Series(0.5, index=df.index)
    df["Vortex_Neg_20"] = vortex_20.iloc[:, 1].fillna(0.5) if vortex_20 is not None else pd.Series(0.5, index=df.index)
    aroon_result = pta.aroon(df["high"], df["low"], length=14)
    df["Aroon_Up"] = aroon_result.iloc[:, 1].fillna(50) if aroon_result is not None else pd.Series(50, index=df.index)
    df["Aroon_Down"] = aroon_result.iloc[:, 0].fillna(50) if aroon_result is not None else pd.Series(50, index=df.index)
    df["RVI_10"] = pta.rvi(df["high"], df["low"], df["close"], length=10).fillna(50)
    
    return df