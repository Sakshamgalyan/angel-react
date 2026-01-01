import { SmartAPI } from 'smartapi-javascript';
import { TOTP } from 'totp-generator';

export interface AngelCredentials {
    apiKey: string;
    clientCode: string;
    password: string;
    totpKey: string;
}

// Interface for Candle Data
export interface CandleData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Cache for sessions: apiKey -> { instance: SmartAPI, sessionData: any, token: string }
const sessionCache = new Map<string, { instance: any, sessionData: any }>();

export const getAngelClient = async (credentials: AngelCredentials) => {
    const { apiKey, clientCode, password, totpKey } = credentials;

    if (!apiKey || !clientCode || !password || !totpKey) {
        throw new Error('Missing Angel One credentials');
    }

    // Check if valid session exists
    if (sessionCache.has(apiKey)) {
        return sessionCache.get(apiKey)!.instance;
    }

    const smartApiInstance = new SmartAPI({
        api_key: apiKey,
    });

    const { otp } = await TOTP.generate(totpKey);

    try {
        const data = await smartApiInstance.generateSession(clientCode, password, otp);
        
        if (data.status === false) {
             throw new Error(data.message || 'Login failed');
        }

        sessionCache.set(apiKey, { instance: smartApiInstance, sessionData: data });
        return smartApiInstance;
    } catch (error) {
        console.error('Angel One Login Failed:', error);
        throw error;
    }
};

// Retry helper
const retry = async <T>(fn: () => Promise<T>, credentials: AngelCredentials, retries = 3, delay = 500): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0) {
            // Check for session expiry (AB1004) or "Invalid Session"
            const errorMessage = error.message ? error.message.toLowerCase() : '';
            if (errorMessage.includes('ab1004') || errorMessage.includes('invalid session') || errorMessage.includes('invalid token')) {
                console.log(`Session expired for ${credentials.clientCode}, re-authenticating...`);
                sessionCache.delete(credentials.apiKey);
                // Re-authenticate inside the retry loop effectively by clearing cache
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, credentials, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const fetchCandleData = async (
    credentials: AngelCredentials,
    exchange: string,
    symbolToken: string,
    interval: string,
    fromDate: string,
    toDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient(credentials);
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
    }, credentials);
};

export const fetchOIData = async (
    credentials: AngelCredentials,
    exchange: string,
    symbolToken: string,
    interval: string,
    fromDate: string,
    toDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient(credentials);
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
    }, credentials);
};

export const fetchMarketData = async (
    credentials: AngelCredentials,
    mode: string,
    exchangeTokens: Record<string, string[]>
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient(credentials);
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
    }, credentials);
};

export const fetchOptionGreeks = async (
    credentials: AngelCredentials,
    name: string,
    expiryDate: string
): Promise<any[]> => {
    return retry(async () => {
        const client = await getAngelClient(credentials);
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
    }, credentials);
};
