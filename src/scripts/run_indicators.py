import sys
import json
import pandas as pd
import os

# Add the scripts directory to sys.path to import technical_indicators
current_dir = os.path.dirname(os.path.abspath(__file__))
scripts_dir = current_dir
sys.path.insert(0, scripts_dir)

try:
    from technical_indicators import fetch_technical_indicators
except ImportError as e:
    print(json.dumps({"error": f"Failed to import technical_indicators: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)

        candles = json.loads(input_data)
        
        # Convert to DataFrame expected by fetch_technical_indicators
        # Expected columns: ["timestamp", "open", "high", "low", "close", "volume"]
        # The input candles might be a list of dicts or list of lists depending on how we send it
        # Let's assume list of dicts from our TypeScript interface
        
        df = pd.DataFrame(candles)
        
        # Ensure columns are correct and in order
        required_cols = ["timestamp", "open", "high", "low", "close", "volume"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing column: {col}")
        
        df = df[required_cols]

        # Run indicators
        result_df = fetch_technical_indicators(df.values.tolist())
        
        # Convert back to JSON
        # We'll use 'records' orientation to get a list of dicts
        output_json = result_df.to_json(orient='records', date_format='iso')
        
        print(output_json)

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
