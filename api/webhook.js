import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("Webhook body:", data);

    const signal = data.signal;
    console.log("Received signal:", signal);

    if (!signal) return res.status(400).send("No signal provided");

    if (signal === "LONG") {
      await placeOrder("BUY");
    } else if (signal === "SHORT") {
      await placeOrder("SELL");
    }

    res.status(200).send("Order attempt complete");
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).send("Server error - check logs");
  }
}

async function placeOrder(side) {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("Missing API credentials!");
    return;
  }

  console.log(`Pretend placing ${side} order with API_KEY=${apiKey}`);
  
  // TEMP: Comment out axios until signing is fixed
  // await axios.post("https://api.testnet.binance.com/fapi/v1/order", {...});
}
