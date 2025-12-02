import { NextResponse } from 'next/server';
import { fetchCandleData } from '@/lib/angel';
import { spawn } from 'child_process';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Helper to find symbol token
const getSymbolInfo = (symbol: string) => {
    try {
        const instrumentsPath = path.join(process.cwd(), 'instruments.json');
        console.log('Searching for symbol:', symbol);

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
            console.log('Trying normalized symbol:', normalizedSymbol);
            found = instruments.find((item: any) => item.symbol.toUpperCase() === normalizedSymbol.toUpperCase());
        }

        // If still not found, try replacing hyphen with underscore (just in case)
        if (!found && symbol.includes('-')) {
            const normalizedSymbol = symbol.replace(/-/g, '_');
            console.log('Trying normalized symbol:', normalizedSymbol);
            found = instruments.find((item: any) => item.symbol.toUpperCase() === normalizedSymbol.toUpperCase());
        }

        if (found) {
            console.log('Symbol found:', found.symbol, found.token);
        } else {
            console.log('Symbol not found in instruments list');
        }
        return found;
    } catch (error) {
        console.error('Error reading instruments.json:', error);
        return null;
    }
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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { symbol, timeframe, data_time } = body;

        if (!symbol || !timeframe) {
            return NextResponse.json({ error: 'Missing symbol or timeframe' }, { status: 400 });
        }

        // 1. Get Symbol Info
        const symbolInfo = getSymbolInfo(symbol);
        if (!symbolInfo) {
            return NextResponse.json({ error: 'Symbol not found or instruments.json missing' }, { status: 400 });
        }

        const { token: symbolToken, exch_seg: exchange } = symbolInfo;

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

        // 3. Fetch Candle Data
        const candles = await fetchCandleData(
            exchange,
            symbolToken,
            config.interval,
            formatDate(startTime),
            formatDate(endTime)
        );

        if (!candles || candles.length === 0) {
            return NextResponse.json({ error: 'No candle data found' }, { status: 404 });
        }

        // 4. Run Python Script
        const pythonScriptPath = path.join(process.cwd(), 'src/scripts/run_indicators.py');

        // Pass environment variables to ensure Python can find user-installed packages
        // Explicitly set PYTHONPATH to include user site-packages directory
        const userHome = process.env.HOME || process.env.USERPROFILE || '';
        const pythonPath = [
            `${userHome}/.local/lib/python3.12/site-packages`,
            '/usr/local/lib/python3.12/dist-packages',
            '/usr/lib/python3/dist-packages',
        ].filter(Boolean).join(':');

        const pythonProcess = spawn('python3', [pythonScriptPath], {
            env: {
                ...process.env,
                HOME: userHome,
                PATH: process.env.PATH || '',
                PYTHONPATH: pythonPath,
                PYTHONIOENCODING: 'utf-8',
            }
        });

        let resultData = '';
        let errorData = '';

        const pythonPromise = new Promise<any>((resolve, reject) => {
            pythonProcess.stdout.on('data', (data) => {
                resultData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${errorData}`));
                } else {
                    try {
                        resolve(JSON.parse(resultData));
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${resultData}`));
                    }
                }
            });

            // Send data to Python script
            pythonProcess.stdin.write(JSON.stringify(candles));
            pythonProcess.stdin.end();
        });

        const analyzedData = await pythonPromise;

        if (analyzedData.error) {
            return NextResponse.json({ error: analyzedData.error }, { status: 500 });
        }

        // 5. Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(analyzedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // 6. Return File
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${symbol}_${timeframe}_analysis.xlsx"`,
            },
        });

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
