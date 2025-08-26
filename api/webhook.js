import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const data = req.body;

  // 👇 This will show you the raw TradingView alert data in Vercel logs
  console.log("Webhook body:", req.body);

  const signal = data.signal;

  console.log("Received signal:", signal);

  try {
    if (signal === "LONG") {
      await placeOrder("BUY");
    } else if (signal === "SHORT") {
      await placeOrder("SELL");
    }

    res.status(200).send("Order sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing order");
  }
}

async function placeOrder(side) {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  console.log(`Placing ${side} order with API_KEY=${apiKey}`);

  await axios.post("https://api.testnet.binance.com/fapi/v1/order", {
    symbol: "BTCUSDT",
    side: side,
    type: "MARKET",
    quantity: 0.001
  }, {
    headers: { "X-MBX-APIKEY": apiKey }
  });
}

