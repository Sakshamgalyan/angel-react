
// using native fetch


// Payload from user logs
const payload = {
    symbol: "RELIANCE-EQ",
    timeframe: "3min",
    technicals: "True",
    data_time: "2025-12-29 09:43" // Using a fixed time within range if needed, or omit
};

async function testApi() {
    try {
        console.log("Sending POST request to /api/analyze...");
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`);
        
        if (response.status !== 200) {
            const errorText = await response.text();
            console.error("Error Response Body:", errorText);
        } else {
            console.log("Success! Response is an Excel file (binary).");
            const buffer = await response.arrayBuffer();
            console.log(`Received buffer size: ${buffer.byteLength} bytes`);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testApi();
