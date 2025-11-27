export type FormDataShape = {
    symbol: string;
    timeframe: string;
    data_time?: string;
    technicals: string;
    fundamentals: string;
    news: string;
    peers: string;
};

export type ResponseShape = {
    type?: string;
    message?: React.ReactNode;
    data?: unknown;
};

export type Theme = 0 | 1; // 0 = dark, 1 = light
