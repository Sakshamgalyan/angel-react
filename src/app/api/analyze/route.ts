import { NextResponse } from 'next/server';
import { fetchCandleData, fetchOIData, fetchMarketData, fetchOptionGreeks } from '@/lib/angel';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { fetchTechnicalIndicators } from '@/lib/technical-indicators';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/types/user';

// Helper to find symbol info
const getSymbolInfo = (symbol: string) => {
    try {
        const instrumentsPath = path.join(process.cwd(), 'instruments.json');

        if (!fs.existsSync(instrumentsPath)) {
            console.error('instruments.json not found at:', instrumentsPath);
            return null;
        }
        const fileContent = fs.readFileSync(instrumentsPath, 'utf-8');
        const instruments = JSON.parse(fileContent);

        // Try exact match first (case-insensitive)
        let found = instruments.find((item: any) => item.symbol.toUpperCase() === symbol.toUpperCase());

        // If not found, try replacing underscore with hyphen
        if (!found && symbol.includes('_')) {
            const normalizedSymbol = symbol.replace(/_/g, '-');
            found = instruments.find((item: any) => item.symbol.toUpperCase() === normalizedSymbol.toUpperCase());
        }

        // If still not found, try replacing hyphen with underscore
        if (!found && symbol.includes('-')) {
            const normalizedSymbol = symbol.replace(/-/g, '_');
            found = instruments.find((item: any) => item.symbol.toUpperCase() === normalizedSymbol.toUpperCase());
        }

        return found;
    } catch (error) {
        console.error('Error reading instruments.json:', error);
        return null;
    }
};

// Determine asset class based on exchange
const determineAssetClass = (exchange: string): string => {
    if (exchange === "CDS") return "Currency / Interest Rate";
    if (["MCX", "NCDEX", "NCO"].includes(exchange)) return "Commodity";
    return "Equity";
};

// Extract latest OI from OI data
const extractLatestOI = (data: any[]): number => {
    try {
        if (!data || data.length === 0) return 0.0;
        const parseTimestamp = (t: string) => new Date(t.replace(' ', 'T').replace('+05:30', ''));
        const latestRow = data.reduce((latest, current) =>
            parseTimestamp(current.time) > parseTimestamp(latest.time) ? current : latest
        );
        return parseFloat(latestRow.oi || 0);
    } catch (error) {
        console.error('Error parsing OI data:', error);
        return 0.0;
    }
};

// Filter and sort valid candles
const filterValidCandles = (candles: any[]): any[] => {
    const parseTimestamp = (ts: string) => new Date(ts.replace(' ', 'T').replace('+05:30', ''));
    const valid = candles.filter(c =>
        c.length >= 6 && c.slice(1, 6).every((x: any) => typeof x === 'number')
    );
    return valid.sort((a, b) => parseTimestamp(a[0]).getTime() - parseTimestamp(b[0]).getTime());
};

// Timeframe config mapping
const TIMEFRAME_CONFIG: Record<string, { interval: string; minutes: number; max_days: number }> = {
    "1min": { "interval": "ONE_MINUTE", "minutes": 1, "max_days": 30 },
    "3min": { "interval": "THREE_MINUTE", "minutes": 3, "max_days": 60 },
    "5min": { "interval": "FIVE_MINUTE", "minutes": 5, "max_days": 100 },
    "10min": { "interval": "TEN_MINUTE", "minutes": 10, "max_days": 100 },
    "15min": { "interval": "FIFTEEN_MINUTE", "minutes": 15, "max_days": 200 },
    "30min": { "interval": "THIRTY_MINUTE", "minutes": 30, "max_days": 200 },
    "1hr": { "interval": "ONE_HOUR", "minutes": 60, "max_days": 400 },
    "1day": { "interval": "ONE_DAY", "minutes": 390, "max_days": 2000 }
};

const INDICATOR_COLUMNS = [
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
];

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { symbol, timeframe, data_time, technicals, fundamentals, news, peers } = body;

        // Helper to parse boolean or string 'true'/'false'
        const parseBoolean = (val: any) => {
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') return val.toLowerCase() === 'true';
            return false;
        };

        const isTechnicalsEnabled = parseBoolean(technicals);

        if (!symbol || !timeframe) {
            return NextResponse.json({ error: 'Missing symbol or timeframe' }, { status: 400 });
        }

        console.log(`Received request: symbol=${symbol}, timeframe=${timeframe}, data_time=${data_time}, technicals=${technicals}`);

        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth-token');

        if (!authToken || !authToken.value || !ObjectId.isValid(authToken.value)) {
            return NextResponse.json({ error: 'Unauthorized: No valid session found' }, { status: 401 });
        }

        const db = await getDatabase();
        const user = await db.collection<User>('users').findOne({ _id: new ObjectId(authToken.value) });

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
        }

        const { angelApiKey, angelClientCode, angelTOTPKey, angelPassword } = user;

        const handleLockout = async (msg: string, status: number) => {
             await db.collection('users').updateOne({ _id: user._id }, { $inc: { failedLoginAttempts: 1 } });
             const updatedUser = await db.collection('users').findOne({ _id: user._id });
             if (updatedUser && (updatedUser.failedLoginAttempts || 0) >= 5) {
                 await db.collection('users').updateOne({ _id: user._id }, { 
                     $set: { isLocked: true, locked: true, lockedAt: new Date().toISOString(), isLockedAt: new Date().toISOString() } 
                 });
                 return NextResponse.json({ error: 'Account locked due to multiple failed attempts. Please wait 24 hours.' }, { status: 403 });
             }
             return NextResponse.json({ error: msg }, { status: status });
        };

        if (!angelApiKey || !angelClientCode || !angelTOTPKey || !angelPassword) {
            return NextResponse.json({ 
                error: 'Missing Angel One credentials. Please configure them in your settings.' 
            }, { status: 400 });
        }

        const credentials = {
            apiKey: angelApiKey,
            clientCode: angelClientCode,
            password: angelPassword,
            totpKey: angelTOTPKey
        };
        console.log('Credentials:', credentials);

        // 1. Get Symbol Info
        const symbolInfo = getSymbolInfo(symbol);
        if (!symbolInfo) {
            return await handleLockout('Symbol not found.', 400);
        }

        const symbolToken = symbolInfo.token;
        const exchange = symbolInfo.exch_seg || 'NSE';
        const instrumentType = symbolInfo.instrumenttype || '';
        const name = symbolInfo.name || '';
        const expiry = symbolInfo.expiry || '';
        const strike = symbolInfo.strike ? parseFloat(symbolInfo.strike) / 100 : 0;

        // Determine if it's an option
        let optionType: string | null = null;
        if (symbol.endsWith('CE') || symbol.endsWith('PE')) {
            optionType = symbol.slice(-2).toUpperCase();
        }

        const assetClass = determineAssetClass(exchange);

        // 2. Calculate Dates
        const config = TIMEFRAME_CONFIG[timeframe];
        if (!config) {
            return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 });
        }

        const endTime = data_time ? new Date(data_time) : new Date();
        const startTime = new Date(endTime.getTime() - (config.max_days * 24 * 60 * 60 * 1000));

        // Format dates as YYYY-MM-DD HH:MM
        const formatDate = (date: Date) => {
            return date.toISOString().replace('T', ' ').substring(0, 16);
        };

        const historicParams = {
            exchange,
            symboltoken: symbolToken,
            interval: config.interval,
            fromdate: formatDate(startTime),
            todate: formatDate(endTime)
        };

        console.log('Fetching candles with historic_params:', historicParams);

        // 3. Fetch Data in Parallel
        const dataPromises: Promise<any>[] = [
            fetchCandleData(credentials,exchange, symbolToken, config.interval, formatDate(startTime), formatDate(endTime)),
            fetchOIData(credentials, exchange, symbolToken, config.interval, formatDate(startTime), formatDate(endTime)),
            fetchMarketData(credentials, 'FULL', { [exchange]: [symbolToken] })
        ];

        // Add option greeks if applicable
        if (optionType && expiry && strike && name) {
            dataPromises.push(fetchOptionGreeks(credentials, name, expiry));
        }

        const results = await Promise.allSettled(dataPromises);
        
        // Check for rejection due to credentials in Candle Data (primary fetch) specifically or any critical failure
        const candleResult = results[0];
        
        if (candleResult.status === 'rejected') {
             const error = candleResult.reason;
             const errorMessage = error?.message?.toLowerCase() || '';
             
             console.log('[DEBUG] Angel API Error Message:', errorMessage);
             console.log('[DEBUG] Angel API Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

             if (errorMessage.includes('invalid') || errorMessage.includes('credential') || errorMessage.includes('login') || errorMessage.includes('ab1004') || errorMessage.includes('unauthorized')) {
                  console.log('[DEBUG] Detected Auth Error.');
                  return await handleLockout('Angel One Login Failed. Please check your credentials.', 401);
             } else {
                 console.log('[DEBUG] Error did not match auth keywords.');
             }
        } else {
            // Success - Reset failed attempts if any existed
             if ((user.failedLoginAttempts || 0) > 0) {
                 await db.collection('users').updateOne(
                     { _id: user._id },
                     { $set: { failedLoginAttempts: 0 } }
                 );
             }
        }
        if (candleResult.status === 'rejected' || !candleResult.value || candleResult.value.length === 0) {
            console.error('Failed to fetch candle data');
            return NextResponse.json({ error: 'No candle data found' }, { status: 500 });
        }
        const candles = filterValidCandles(candleResult.value);
        if (candles.length === 0) {
            console.error('No valid candles after filtering');
            return NextResponse.json({ error: 'No valid candles fetched' }, { status: 500 });
        }
        console.log(`Successfully fetched ${candles.length} valid candles`);

        // Process OI data
        let latestOI = 0.0;
        const oiResult = results[1];
        if (oiResult.status === 'fulfilled' && oiResult.value) {
            latestOI = extractLatestOI(oiResult.value);
        } else {
            console.warn('Failed to fetch OI data');
        }

        // Process market data
        let marketDataValues: any = {
            LTP: 0.0,
            "52WeekHigh": 0.0,
            "52WeekLow": 0.0,
            TradeVolume: 0.0,
            UpperCircuit: 0.0,
            LowerCircuit: 0.0,
            AvgPrice: 0.0,
            ExchFeedTime: '',
            ExchTradeTime: '',
            TotalBuyQty: 0.0,
            TotalSellQty: 0.0,
            OpenInterest: 0.0,
            "Today'sOpen": 0.0,
            "Today'sHigh": 0.0,
            "Today'sLow": 0.0,
            "PreviousDay'sClose": 0.0,
            "GapUp/Down": 0.0
        };

        const marketResult = results[2];
        if (marketResult.status === 'fulfilled' && marketResult.value) {
            const fetchedData = marketResult.value[0] || {};
            marketDataValues = {
                LTP: parseFloat(fetchedData.ltp || 0),
                "52WeekHigh": parseFloat(fetchedData['52WeekHigh'] || 0),
                "52WeekLow": parseFloat(fetchedData['52WeekLow'] || 0),
                TradeVolume: parseFloat(fetchedData.tradeVolume || 0),
                UpperCircuit: parseFloat(fetchedData.upperCircuit || 0),
                LowerCircuit: parseFloat(fetchedData.lowerCircuit || 0),
                AvgPrice: parseFloat(fetchedData.avgPrice || 0),
                ExchFeedTime: fetchedData.exchFeedTime || '',
                ExchTradeTime: fetchedData.exchTradeTime || '',
                TotalBuyQty: parseFloat(fetchedData.totBuyQuan || 0),
                TotalSellQty: parseFloat(fetchedData.totSellQuan || 0),
                OpenInterest: parseFloat(fetchedData.opnInterest || 0),
                "Today'sOpen": parseFloat(fetchedData.open || 0),
                "Today'sHigh": parseFloat(fetchedData.high || 0),
                "Today'sLow": parseFloat(fetchedData.low || 0),
                "PreviousDay'sClose": parseFloat(fetchedData.close || 0),
                "GapUp/Down": parseFloat(fetchedData.open || 0) - parseFloat(fetchedData.close || 0)
            };
        } else {
            console.warn('Failed to fetch market data');
        }

        // Process option greeks
        let optionGreeksData: any = {};
        if (optionType && results[3]) {
            const greeksResult = results[3];
            if (greeksResult.status === 'fulfilled' && greeksResult.value) {
                const greeksList = greeksResult.value;
                const match = greeksList.find((g: any) =>
                    parseFloat(g.strikePrice || 0) === strike &&
                    (g.optionType || '').toUpperCase() === optionType
                );
                if (match) {
                    optionGreeksData = {
                        delta: parseFloat(match.delta || 0),
                        gamma: parseFloat(match.gamma || 0),
                        theta: parseFloat(match.theta || 0),
                        vega: parseFloat(match.vega || 0),
                        impliedVolatility: parseFloat(match.impliedVolatility || 0),
                        optionTradeVolume: parseFloat(match.tradeVolume || 0)
                    };
                } else {
                    console.warn(`No matching greeks found for strike=${strike}, type=${optionType}`);
                }
            } else {
                console.warn('Failed to fetch option greeks');
            }
        }

        // 4. Build initial result
        const requestId = `${symbol}_${Date.now()}`;
        const fetchTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const userSpecifiedTime = data_time || formatDate(endTime);
        const dataPointsUsed = candles.length;
        const statusMessage = `Success: ${candles.length} candles fetched`;

        let result: any = {
            status: 'success',
            request_id: requestId,
            fetch_time: fetchTime,
            user_specified_time: userSpecifiedTime,
            symbol,
            exchange,
            timeframe,
            data_points_used: dataPointsUsed,
            status_message: statusMessage,
            ...marketDataValues
        };

        // 5. Calculate Technical Indicators (TypeScript)
        // isTechnicalsEnabled is already parsed above
        if (isTechnicalsEnabled && candles.length > 0) {
                try {
                    console.log(`[Debug] Calculating technical indicators for ${candles.length} candles...`);
                    // Check if candles have correct shape
                    if (candles.length > 0) {
                        console.log(`[Debug] First candle sample: ${JSON.stringify(candles[0])}`);
                    }

                    const latestRow = fetchTechnicalIndicators(candles);
                    console.log('[Debug] Technical indicators calculated successfully.');

                    // Add OHLCV data
                    result.timestamp = latestRow.timestamp;
                    result.open = latestRow.open;
                    result.high = latestRow.high;
                    result.low = latestRow.low;
                    result.close = latestRow.close;
                    result.volume = latestRow.volume;
    
                    for (const col of INDICATOR_COLUMNS) {
                        result[col] = latestRow[col] || 0;
                    }
    
                    // Add OI and option greeks if available
                    result.LatestOI = latestOI;
                    if (Object.keys(optionGreeksData).length > 0) {
                        result.delta = optionGreeksData.delta;
                        result.gamma = optionGreeksData.gamma;
                        result.theta = optionGreeksData.theta;
                        result.vega = optionGreeksData.vega;
                        result.impliedVolatility = optionGreeksData.impliedVolatility;
                        result.optionTradeVolume = optionGreeksData.optionTradeVolume;
                    }
    
                } catch (error: any) {
                    console.error('[CRITICAL ERROR] Error computing technical indicators in route.ts:', error);
                    console.error('[CRITICAL ERROR] Stack:', error.stack);
                    console.error('[CRITICAL ERROR] Input Candles Length:', candles.length);
                    if (candles.length > 0) console.error('[CRITICAL ERROR] First Candle:', JSON.stringify(candles[0]));
                    
                    return NextResponse.json({
                        status: 'error',
                        message: `Failed to compute indicators: ${error.message}`,
                        stack: error.stack
                    }, { status: 500 });
                }
        }

        // 6. Generate Excel File
        const wb = XLSX.utils.book_new();

        // Sheet 1: Input Dashboard
        const dashboardHeaders = [
            "request_id", "fetch_time", "user_specified_time", "timestamp", "asset_class",
            "symbol", "exchange", "Source", "timeframe", "technicals",
            "fundamentals", "news", "peers", "status_message"
        ];
        const dashboardRow = [
            requestId,
            fetchTime,
            userSpecifiedTime,
            result.timestamp || formatDate(endTime),
            assetClass,
            symbol,
            exchange,
            "Angel One",
            timeframe,
            technicals,
            fundamentals,
            news,
            peers,
            statusMessage
        ];
        const wsDashboard = XLSX.utils.aoa_to_sheet([dashboardHeaders, dashboardRow]);
        XLSX.utils.book_append_sheet(wb, wsDashboard, "Input Dashboard");

        // Sheet 2: Technical Indicators
        if (isTechnicalsEnabled && result.timestamp) {
            const techHeaders = [
                "request_id", "fetch_time", "timestamp", "symbol", "timeframe", "data_points_used",
                "open", "high", "low", "close", "volume",
                ...INDICATOR_COLUMNS,
                "LTP", "52WeekHigh", "52WeekLow", "TradeVolume", "UpperCircuit", "LowerCircuit",
                "AvgPrice", "ExchFeedTime", "ExchTradeTime", "TotalBuyQty", "TotalSellQty", "OpenInterest",
                "Today'sOpen", "Today'sHigh", "Today'sLow", "PreviousDay'sClose", "GapUp/Down",
                "LatestOI", "delta", "gamma", "theta", "vega", "impliedVolatility", "optionTradeVolume"
            ];

            const techRow = [
                requestId, fetchTime, result.timestamp, symbol, timeframe, dataPointsUsed,
                result.open, result.high, result.low, result.close, result.volume,
                ...INDICATOR_COLUMNS.map(col => result[col] || ""),
                result.LTP, result["52WeekHigh"], result["52WeekLow"], result.TradeVolume, result.UpperCircuit, result.LowerCircuit,
                result.AvgPrice, result.ExchFeedTime, result.ExchTradeTime, result.TotalBuyQty, result.TotalSellQty, result.OpenInterest,
                result["Today'sOpen"], result["Today'sHigh"], result["Today'sLow"], result["PreviousDay'sClose"], result["GapUp/Down"],
                latestOI,
                result.delta || "", result.gamma || "", result.theta || "", result.vega || "", result.impliedVolatility || "", result.optionTradeVolume || ""
            ];

            const wsTech = XLSX.utils.aoa_to_sheet([techHeaders, techRow]);
            XLSX.utils.book_append_sheet(wb, wsTech, "Technical Indicators");
        }

        // Generate buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Return file response
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${symbol}_${timeframe}_analysis.xlsx"`
            }
        });

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
