const axios = require("axios");
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    // parse TradingView JSON
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("Webhook body:", data);

    const { signal, symbol, amount } = data;

    if (!signal) return res.status(400).send("No signal provided");
    if (!symbol) return res.status(400).send("No symbol provided");
    if (!amount) return res.status(400).send("No amount provided");

    if (signal === "LONG") {
      await placeOrder(symbol, "BUY", amount);
    } else if (signal === "SHORT") {
      await placeOrder(symbol, "SELL", amount);
    } else {
      return res.status(400).send("Invalid signal, must be LONG or SHORT");
    }

    res.status(200).send("Order attempt complete");
  } catch (err) {
    console.error("Handler error:", err.response?.data || err.message);
    res.status(500).send("Server error - check logs");
  }
}

async function placeOrder(symbol, side, quantity) {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("Missing API credentials!");
    return;
  }

  try {
    const url = "https://api.bydfi.com/fapi/v1/order"; // BYDFi Futures endpoint
    const timestamp = Date.now().toString();

    const body = {
      symbol: symbol.toUpperCase(), // e.g. BTCUSDT
      side,                        // "BUY" or "SELL"
      type: "MARKET",               // Market order
      positionSide: "BOTH",         // Can be "LONG" or "SHORT" if you use hedged positions
      quantity: quantity.toString() // Contract size
    };

    const payload = timestamp + JSON.stringify(body);

    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(payload)
      .digest("hex");

    const headers = {
      "Content-Type": "application/json",
      "X-BYDFI-APIKEY": apiKey,
      "X-BYDFI-SIGN": signature,
      "X-BYDFI-TIMESTAMP": timestamp,
    };

    const response = await axios.post(url, body, { headers });
    console.log("✅ BYDFi Futures Order Response:", response.data);
  } catch (err) {
    console.error("❌ BYDFi Futures order error:", err.response?.data || err.message);
  }
}