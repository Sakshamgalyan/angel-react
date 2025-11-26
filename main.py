from flask import Flask, request, jsonify, send_file
from datetime import datetime, timedelta
import json
import pytz
import logging
import time
from typing import Tuple, List, Any, Dict, Optional
import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
import requests
from SmartApi.smartConnect import SmartConnect
from technical_indicators import fetch_technical_indicators
from angel_auth import authenticate
from concurrent.futures import ThreadPoolExecutor, as_completed

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)

# Authenticate with Angel
smartApi, jwt_token, feed_token = authenticate()

# Load config and instruments
with open("config.json") as f:
    config = json.load(f)

with open("instruments.json") as f:
    instruments = json.load(f)

# Timezone
IST = pytz.timezone("Asia/Kolkata")

# Google Sheets setup
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
creds = service_account.Credentials.from_service_account_info(config["google_creds"], scopes=SCOPES)
sheets_service = build("sheets", "v4", credentials=creds)
sheet = sheets_service.spreadsheets()

# Flask app
app = Flask(__name__, static_folder="static")

# Angel One historical limits (maximized for warmup)
TIMEFRAME_CONFIG = {
    "1min": {"interval": "ONE_MINUTE", "minutes": 1, "max_days": 30},
    "3min": {"interval": "THREE_MINUTE", "minutes": 3, "max_days": 60},
    "5min": {"interval": "FIVE_MINUTE", "minutes": 5, "max_days": 100},
    "10min": {"interval": "TEN_MINUTE", "minutes": 10, "max_days": 100},
    "15min": {"interval": "FIFTEEN_MINUTE", "minutes": 15, "max_days": 200},
    "30min": {"interval": "THIRTY_MINUTE", "minutes": 30, "max_days": 200},
    "1hr": {"interval": "ONE_HOUR", "minutes": 60, "max_days": 400},
    "1day": {"interval": "ONE_DAY", "minutes": 390, "max_days": 2000}
}

# Retry decorator
def retry(max_attempts: int = 3, initial_delay: float = 0.5, factor: float = 2.0):
    def decorator(func):
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exc = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as exc:
                    last_exc = exc
                    logger.warning(f"Attempt {attempt} failed for {func.__name__}: {exc}")
                    if attempt < max_attempts:
                        time.sleep(delay)
                        delay *= factor
            logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            raise last_exc
        return wrapper
    return decorator

# Utility functions
def get_symbol_info(symbol: str) -> Optional[Dict[str, Any]]:
    return next((item for item in instruments if item["symbol"].upper() == symbol.upper()), None)

def determine_asset_class(exchange: str) -> str:
    if exchange == "CDS":
        return "Currency / Interest Rate"
    if exchange in ["MCX", "NCDEX", "NCO"]:
        return "Commodity"
    return "Equity"

def parse_end_time(data_time: Optional[str]) -> Tuple[datetime, Optional[str]]:
    end_time = datetime.now(IST)
    user_specified_time = None
    if data_time:
        try:
            end_time = datetime.strptime(data_time, "%Y-%m-%d %H:%M").replace(tzinfo=IST)
            user_specified_time = data_time
        except ValueError:
            raise ValueError("Invalid data_time format (use YYYY-MM-DD HH:MM)")
    return end_time, user_specified_time

# Smart API wrappers
def reauthenticate_and_call(api_call_fn, *args, **kwargs):
    global smartApi, jwt_token, feed_token
    resp = api_call_fn(*args, **kwargs)
    if isinstance(resp, dict) and resp.get("status") is False:
        msg = resp.get("message", "")
        if "ab1004" in str(msg).lower():
            logger.info("Received ab1004 — re-authenticating and retrying Smart API call")
            smartApi, jwt_token, feed_token = authenticate()
            resp = api_call_fn(*args, **kwargs)
    return resp

@retry(max_attempts=3, initial_delay=0.5)
def fetch_candle_data(historic_params: dict) -> dict:
    return reauthenticate_and_call(lambda p: smartApi.getCandleData(p), historic_params)

@retry(max_attempts=3, initial_delay=0.5)
def fetch_oi_data(historic_params: dict) -> dict:
    return reauthenticate_and_call(lambda p: smartApi.getOIData(p), historic_params)

@retry(max_attempts=3, initial_delay=0.5)
def fetch_market_data(mode: str, payload: dict) -> dict:
    return reauthenticate_and_call(lambda m, p: smartApi.getMarketData(m, p), mode, payload)

@retry(max_attempts=3, initial_delay=0.5)
def fetch_option_greeks_bulk(payload: dict) -> dict:
    return reauthenticate_and_call(lambda p: smartApi.optionGreek(p), payload)

# Data processing helpers
def extract_latest_oi(data: List[Dict[str, Any]]) -> float:
    try:
        if not data:
            return 0.0
        def parse_ts(t: str) -> datetime:
            try:
                t = t.replace(" ", "T") if " " in t and "T" not in t else t
                return datetime.fromisoformat(t.replace("+05:30", ""))
            except Exception:
                return datetime.fromisoformat(t)
        latest_row = max(data, key=lambda x: parse_ts(x["time"]))
        return float(latest_row.get("oi", 0.0))
    except Exception as e:
        logger.error(f"Error parsing OI data: {e}, data: {data}")
        return 0.0

def filter_valid_candles(new_candles: List[List[Any]]) -> List[List[Any]]:
    def parse_ts(ts: str) -> datetime:
        try:
            ts = ts.replace(" ", "T") if " " in ts and "T" not in ts else ts
            return datetime.fromisoformat(ts.replace("+05:30", ""))
        except Exception:
            return datetime.fromisoformat(ts)
    valid = [c for c in new_candles if len(c) >= 6 and all(isinstance(x, (int, float)) for x in c[1:6])]
    return sorted(valid, key=lambda x: parse_ts(x[0]))

# Sheets append helper
@retry(max_attempts=3, initial_delay=0.5)
def append_to_sheet(range_name: str, values: List[List[Any]]):
    sheet.values().append(
        spreadsheetId=config["settings"]["spreadsheet_id"],
        range=range_name,
        valueInputOption="USER_ENTERED",
        body={"values": values}
    ).execute()

# Flask routes
@app.route("/")
def serve_landing():
    return send_file("landing.html")

@app.route("/app")
def serve_index():
    return send_file("index.html")

@app.route("/script.js")
def serve_js():
    return send_file("script.js")

@app.route("/manifest.json")
def serve_manifest():
    return send_file("static/manifest.json")

@app.route("/status")
def status():
    return jsonify({"status": "ok", "time": datetime.now().astimezone(IST).strftime("%Y-%m-%d %H:%M")})

@app.route("/fetch", methods=["POST"])
def fetch_data():
    try:
        data = request.get_json()
        if not data or "symbol" not in data or "timeframe" not in data:
            return jsonify({"error": "Missing symbol or timeframe"}), 400

        symbol = data.get("symbol").upper()
        timeframe = data.get("timeframe")
        data_time = data.get("data_time")
        technicals = data.get("technicals", "False")
        fundamentals = data.get("fundamentals", "False")
        news = data.get("news", "False")
        peers = data.get("peers", "False")

        logger.info(f"Received request: symbol={symbol}, timeframe={timeframe}, data_time={data_time}")

        symbol_info = get_symbol_info(symbol)
        if not symbol_info:
            return jsonify({"error": "Symbol not found in instruments.json"}), 400

        symbol_token = symbol_info["token"]
        exchange = symbol_info.get("exch_seg", "NSE")
        instrument_type = symbol_info.get("instrumenttype", "")
        name = symbol_info.get("name", "")
        expiry = symbol_info.get("expiry", "")
        strike = float(symbol_info.get("strike", 0)) / 100 if symbol_info.get("strike") else 0.0
        logger.info(f"Symbol info: token={symbol_token}, exchange={exchange}, instrumenttype={instrument_type}, name={name}, expiry={expiry}, strike={strike}")

        option_type = None
        option_greeks_data = {}
        if symbol and (symbol.endswith("CE") or symbol.endswith("PE")):
            option_type = symbol[-2:].upper()
            if expiry and strike and option_type:
                try:
                    greeks_payload = {"name": name, "expirydate": expiry}
                    logger.info(f"Fetching option greeks for payload: {greeks_payload}")
                    # Greeks will be fetched in parallel below
                except Exception as e:
                    logger.error(f"Error preparing option greeks: {e}")

        asset_class = determine_asset_class(exchange)
        try:
            end_time, user_specified_time = parse_end_time(data_time)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        logger.info(f"End time: {end_time}")
        if timeframe not in TIMEFRAME_CONFIG:
            return jsonify({"error": "Invalid timeframe"}), 400

        interval = TIMEFRAME_CONFIG[timeframe]["interval"]
        max_days = TIMEFRAME_CONFIG[timeframe]["max_days"]
        start_time = end_time - timedelta(days=max_days)

        historic_params = {
            "exchange": exchange,
            "symboltoken": symbol_token,
            "interval": interval,
            "fromdate": start_time.strftime("%Y-%m-%d %H:%M"),
            "todate": end_time.strftime("%Y-%m-%d %H:%M")
        }
        logger.info(f"Fetching candles with historic_params: {historic_params}")

        # Parallel API calls with labeled futures
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_func = {
                executor.submit(fetch_candle_data, historic_params): "candle_data",
                executor.submit(fetch_oi_data, historic_params): "oi_data",
                executor.submit(fetch_market_data, "FULL", {exchange: [symbol_token]}): "market_data"
            }
            if option_type and expiry and strike:
                future_to_func[executor.submit(fetch_option_greeks_bulk, {"name": name, "expirydate": expiry})] = "greeks_data"

            results = {}
            for future in as_completed(future_to_func):
                try:
                    result = future.result()
                    results[future_to_func[future]] = result
                except Exception as e:
                    logger.error(f"Error in parallel API call for {future_to_func.get(future, 'unknown')}: {e}")

        # Process candle data
        historical_data = results.get("candle_data", {"status": False, "data": []})
        if historical_data.get("status") is False:
            error_msg = historical_data.get("message", "Failed to fetch data")
            logger.error(f"API error fetching candles: {error_msg}")
            return jsonify({"error": error_msg}), 500

        new_candles = historical_data.get("data", [])
        candles = filter_valid_candles(new_candles)
        if not candles:
            logger.warning("No valid candles after filtering")
            return jsonify({"error": "No valid candles fetched"}), 500

        logger.info(f"Successfully fetched {len(candles)} valid candles")

        # Process OI data
        oi_response = results.get("oi_data", {"status": False, "data": []})
        latest_oi = 0.0
        if oi_response.get("status") is False:
            logger.warning(f"OI API error: {oi_response.get('message', 'Failed')}")
        else:
            latest_oi = extract_latest_oi(oi_response.get("data", []))

        # Process market data
        market_data_resp = results.get("market_data", {"status": False, "data": {}})
        if market_data_resp.get("status") is False:
            logger.error(f"Market data API error: {market_data_resp.get('message', 'Failed to fetch market data')}")
            market_data_values = {
                "LTP": 0.0, "52WeekHigh": 0.0, "52WeekLow": 0.0, "TradeVolume": 0.0,
                "UpperCircuit": 0.0, "LowerCircuit": 0.0, "AvgPrice": 0.0,
                "ExchFeedTime": "", "ExchTradeTime": "", "TotalBuyQty": 0.0, "TotalSellQty": 0.0,
                "OpenInterest": 0.0, "Today’sOpen": 0.0, "Today’sHigh": 0.0, "Today’sLow": 0.0,
                "PreviousDay’sClose": 0.0, "GapUp/Down": 0.0
            }
        else:
            data = market_data_resp.get("data", {})
            fetched_data = data.get("fetched", [{}])[0] if isinstance(data, dict) else [{}][0]
            market_data_values = {
                "LTP": float(fetched_data.get("ltp", 0.0)),
                "52WeekHigh": float(fetched_data.get("52WeekHigh", 0.0)),
                "52WeekLow": float(fetched_data.get("52WeekLow", 0.0)),
                "TradeVolume": float(fetched_data.get("tradeVolume", 0.0)),
                "UpperCircuit": float(fetched_data.get("upperCircuit", 0.0)),
                "LowerCircuit": float(fetched_data.get("lowerCircuit", 0.0)),
                "AvgPrice": float(fetched_data.get("avgPrice", 0.0)),
                "ExchFeedTime": fetched_data.get("exchFeedTime", ""),
                "ExchTradeTime": fetched_data.get("exchTradeTime", ""),
                "TotalBuyQty": float(fetched_data.get("totBuyQuan", 0.0)),
                "TotalSellQty": float(fetched_data.get("totSellQuan", 0.0)),
                "OpenInterest": float(fetched_data.get("opnInterest", 0.0)),
                "Today’sOpen": float(fetched_data.get("open", 0.0)),
                "Today’sHigh": float(fetched_data.get("high", 0.0)),
                "Today’sLow": float(fetched_data.get("low", 0.0)),
                "PreviousDay’sClose": float(fetched_data.get("close", 0.0)),
                "GapUp/Down": float(fetched_data.get("open", 0.0)) - float(fetched_data.get("close", 0.0))
            }

        # Process option greeks
        if option_type and expiry and strike:
            greeks_resp = results.get("greeks_data", {"status": False, "data": []})
            if greeks_resp.get("status") is True:
                greeks_list = greeks_resp.get("data", [])
                match = next(
                    (g for g in greeks_list if
                     float(g.get("strikePrice", 0)) == strike and
                     g.get("optionType", "").upper() == option_type),
                    None
                )
                if match:
                    option_greeks_data = {
                        "delta": float(match.get("delta", 0)),
                        "gamma": float(match.get("gamma", 0)),
                        "theta": float(match.get("theta", 0)),
                        "vega": float(match.get("vega", 0)),
                        "impliedVolatility": float(match.get("impliedVolatility", 0)),
                        "optionTradeVolume": float(match.get("tradeVolume", 0))
                    }
                else:
                    logger.warning(f"No matching greeks found for strike={strike}, type={option_type}")
            else:
                logger.warning(f"Option greeks API returned error: {greeks_resp.get('message')}")

        request_id = f"{symbol}_{int(datetime.now().timestamp())}"
        fetch_time = datetime.now(IST).strftime("%Y-%m-%d %H:%M")
        user_specified_time = user_specified_time or end_time.strftime("%Y-%m-%d %H:%M")
        data_points_used = len(candles)
        status_message = f"Success: {len(candles)} candles fetched" if candles else "No data returned"

        result = {
            "status": "success",
            "request_id": request_id,
            "fetch_time": fetch_time,
            "user_specified_time": user_specified_time,
            "symbol": symbol,
            "exchange": exchange,
            "timeframe": timeframe,
            "data_points_used": data_points_used,
            "status_message": status_message,
            **market_data_values
        }

        if technicals == "True" and candles:
            try:
                df = fetch_technical_indicators(candles)
                latest_row = df.tail(1).iloc[0]

                indicator_columns = [
                    "EMA_5", "EMA_9", "EMA_12", "EMA_15", "EMA_21", "EMA_50", "EMA_100", "EMA_200",
                    "SMA_10", "SMA_20", "SMA_50", "SMA_100", "SMA_200", "WMA_10", "WMA_20",
                    "HMA_9", "HMA_14", "Ichimoku_Tenkan", "Ichimoku_Kijun", "Ichimoku_Span_A",
                    "Ichimoku_Span_B", "Ichimoku_Chikou", "SAR", "ADX_14", "KAMA_10", "TEMA_9",
                    "Supertrend_2", "Supertrend_3", "Supertrend_4", "RSI_9", "RSI_14",
                    "STOCH_k", "STOCH_d", "Fast_STOCH_k", "Fast_STOCH_d", "WilliamsR_14",
                    "CCI_14", "CCI_20", "MACD", "MACD_Signal", "MACD_Hist",
                    "VWMACD", "VWMACD_Signal", "VWMACD_Hist", "ROC_9", "ROC_12", "Momentum_10",
                    "Stoch_RSI_9", "Stoch_RSI_14", "CMO_9", "CMO_14", "UO", "Klinger", "TRIX_15",
                    "ATR_14", "BB_upper", "BB_lower", "KC_upper", "KC_lower", "DC_upper", "DC_lower",
                    "StdDev_14", "StdDev_20", "OBV", "CMF_14", "CMF_20", "VROC_10", "VROC_14",
                    "AD", "VWAP", "Chaikin_Osc", "MFI_10", "MFI_14", "EFI_13", "EFI_20",
                    "EOM_10", "EOM_14", "Fib_0.0", "Fib_0.236", "Fib_0.382", "Fib_0.5",
                    "Fib_0.618", "Fib_0.786", "Fib_1.0", "Fib_1.618", "Pivot", "S1", "R1",
                    "Fib_Pivot", "Fib_S1", "Fib_R1", "Fib_S2", "Fib_R2", "Woodie_Pivot",
                    "Woodie_S1", "Woodie_R1", "HA_Open", "HA_High", "HA_Low", "HA_Close",
                    "Doji", "Hammer", "Engulfing", "ALMA_9", "DPO_14", "DPO_20",
                    "Vortex_Pos", "Vortex_Neg", "Vortex_Pos_20", "Vortex_Neg_20",
                    "Aroon_Up", "Aroon_Down", "RVI_10"
                ]

                result.update({
                    "timestamp": latest_row["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
                    "open": float(latest_row.get("open", 0)),
                    "high": float(latest_row.get("high", 0)),
                    "low": float(latest_row.get("low", 0)),
                    "close": float(latest_row.get("close", 0)),
                    "volume": float(latest_row.get("volume", 0))
                })

                for col in indicator_columns:
                    result[col] = float(latest_row.get(col, 0))

            except Exception as e:
                logger.error(f"Error computing technical indicators: {e}")
                return jsonify({"status": "error", "message": f"Failed to compute indicators: {str(e)}"}), 500

        dashboard_row = [
            request_id,
            fetch_time,
            user_specified_time,
            result.get("timestamp", end_time.strftime("%Y-%m-%d %H:%M:%S")),
            asset_class,
            symbol,
            exchange,
            "Angel One",
            timeframe,
            technicals,
            fundamentals,
            news,
            peers,
            status_message
        ]

        logger.info("Appending 1 row to Input Dashboard")
        append_to_sheet("Input Dashboard!A:N", [dashboard_row])

        if technicals == "True" and "timestamp" in result:
            technical_row = [result.get(col, "") for col in (
                ["request_id", "fetch_time", "timestamp", "symbol", "timeframe", "data_points_used"] +
                ["open", "high", "low", "close", "volume"] + indicator_columns +
                ["LTP", "52WeekHigh", "52WeekLow", "TradeVolume", "UpperCircuit", "LowerCircuit",
                 "AvgPrice", "ExchFeedTime", "ExchTradeTime", "TotalBuyQty", "TotalSellQty", "OpenInterest",
                 "Today’sOpen", "Today’sHigh", "Today’sLow", "PreviousDay’sClose", "GapUp/Down"]
            )] + [latest_oi]
            if option_greeks_data:
                technical_row += [
                    option_greeks_data.get("delta", ""),
                    option_greeks_data.get("gamma", ""),
                    option_greeks_data.get("theta", ""),
                    option_greeks_data.get("vega", ""),
                    option_greeks_data.get("impliedVolatility", ""),
                    option_greeks_data.get("optionTradeVolume", "")
                ]
            else:
                technical_row += ["", "", "", "", "", ""]
            logger.info("Appending 1 row to Technical Indicators")
            append_to_sheet("Technical Indicators!A:ER", [technical_row])

        return jsonify(result)
    except Exception as e:
        logger.exception("Unexpected error in /fetch")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, host="127.0.0.1", port=5000)

