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

export const fetchCandleData = async (
    exchange: string,
    symbolToken: string,
    interval: string,
    fromDate: string,
    toDate: string
): Promise<CandleData[]> => {
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
            return response.data.map((candle: any[]) => ({
                timestamp: candle[0],
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5],
            }));
        } else {
            throw new Error(response.message || 'Failed to fetch candle data');
        }
    } catch (error) {
        console.error('Error fetching candle data:', error);
        throw error;
    }
};
