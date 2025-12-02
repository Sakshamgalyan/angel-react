declare module 'smartapi-javascript' {
    export class SmartAPI {
        constructor(config: { api_key: string });
        generateSession(clientCode: string, password: string, totp: string): Promise<any>;
        getCandleData(params: any): Promise<any>;
        getOIData(params: any): Promise<any>;
        getMarketData(mode: string, params: any): Promise<any>;
        optionGreek(params: any): Promise<any>;
    }
}
