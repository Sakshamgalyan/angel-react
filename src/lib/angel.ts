import { SmartAPI } from 'smartapi-javascript';
import { TOTP } from 'totp-generator';

// Interface for Candle Data
export interface CandleData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

let smartApiInstance: any = null;
let sessionData: any = null;

export const getAngelClient = async () => {
    if (smartApiInstance && sessionData) {
        return smartApiInstance;
    }

    const apiKey = process.env.ANGEL_API_KEY;
    const clientCode = process.env.ANGEL_CLIENT_CODE;
    const password = process.env.ANGEL_PASSWORD;
    const totpKey = process.env.ANGEL_TOTP_KEY;

    if (!apiKey || !clientCode || !password || !totpKey) {
        throw new Error('Missing Angel One credentials in environment variables');
    }

    smartApiInstance = new SmartAPI({
        api_key: apiKey,
    });

    const { otp } = await TOTP.generate(totpKey);

    try {
        const data = await smartApiInstance.generateSession(clientCode, password, otp);
        sessionData = data;
        return smartApiInstance;
    } catch (error) {
        console.error('Angel One Login Failed:', error);
        throw error;
    }
};

// Retry helper
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0) {
            // Check for session expiry (AB1004)
            if (error.message && error.message.toLowerCase().includes('ab1004')) {
                console.log('Session expired (AB1004), re-authenticating...');
                smartApiInstance = null;
                sessionData = null;
                await getAngelClient();
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const fetchCandleData = async (
    exchange: string,
    symbolToken: string,
    interval: string,
    fromDate: string,
    toDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient();
        try {
            const response = await client.getCandleData({
                exchange,
                symboltoken: symbolToken,
                interval,
                fromdate: fromDate,
                todate: toDate,
            });

            if (response.status && response.data) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch candle data');
            }
        } catch (error) {
            console.error('Error fetching candle data:', error);
            throw error;
        }
    });
};

export const fetchOIData = async (
    exchange: string,
    symbolToken: string,
    interval: string,
    fromDate: string,
    toDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient();
        try {
            const response = await client.getOIData({
                exchange,
                symboltoken: symbolToken,
                interval,
                fromdate: fromDate,
                todate: toDate,
            });

            if (response.status && response.data) {
                return response.data;
            } else {
                console.warn('OI data fetch failed:', response.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching OI data:', error);
            return [];
        }
    });
};

export const fetchMarketData = async (
    mode: string,
    exchangeTokens: Record<string, string[]>
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient();
        try {
            const response = await client.marketData({
                mode: mode,
                exchangeTokens: exchangeTokens
            });

            if (response.status && response.data) {
                const fetched = response.data.fetched || [];
                return fetched;
            } else {
                console.warn('Market data fetch failed:', response.message || 'Unknown error');
                return [];
            }
        } catch (error) {
            console.error('Error fetching market data:', error);
            return [];
        }
    });
};

export const fetchOptionGreeks = async (
    name: string,
    expiryDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient();
        try {
            const response = await client.optionGreek({
                name,
                expirydate: expiryDate,
            });

            if (response.status && response.data) {
                return response.data;
            } else {
                console.warn('Option greeks fetch failed:', response.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching option greeks:', error);
            return [];
        }
    });
};
