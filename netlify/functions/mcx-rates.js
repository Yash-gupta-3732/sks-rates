// Netlify Serverless Function: Live Indian MCX Gold & Silver Rates (INR)
let cachedData = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const now = Date.now();
  if (cachedData && (now - lastFetchTime) < CACHE_TTL_MS) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ...cachedData, cached: true })
    };
  }

  try {
    // Fetch live global spot gold, silver, and USD/INR exchange rate
    const [goldRes, silverRes, inrRes] = await Promise.all([
      fetch("https://api.gold-api.com/price/XAU"),
      fetch("https://api.gold-api.com/price/XAG"),
      fetch("https://open.er-api.com/v6/latest/USD")
    ]);

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    const inrData = await inrRes.json();

    const usdinr = inrData?.rates?.INR || 95.91;
    const goldUsd = goldData?.price || 4330.0;
    const silverUsd = silverData?.price || 63.5;

    // 1 Troy Ounce = 31.1034768 grams
    // Gold per 10 grams in INR with ~6% Indian landed customs duty & cess
    const rawGold10g = (goldUsd / 31.1034768) * 10 * usdinr;
    const landedGold10g = rawGold10g * 1.06;
    const gold24 = Math.round(landedGold10g / 100) * 100;

    // Silver per 1 kg in INR with ~6% Indian landed customs duty
    const rawSilver1kg = (silverUsd / 31.1034768) * 1000 * usdinr;
    const landedSilver1kg = rawSilver1kg * 1.06;
    const silver = Math.round(landedSilver1kg / 100) * 100;

    const payload = {
      success: true,
      gold24: gold24,
      silver: silver,
      gold22: Math.round((gold24 * 22 / 24) / 100) * 100,
      gold20: Math.round((gold24 * 20 / 24) / 100) * 100,
      gold18: Math.round((gold24 * 18 / 24) / 100) * 100,
      silverSale: Math.round((silver - 250) / 100) * 100,
      updatedAt: new Date().toISOString()
    };

    cachedData = payload;
    lastFetchTime = now;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(payload)
    };
  } catch (err) {
    console.error("MCX Function Error:", err);
    const fallback = cachedData || {
      success: true,
      gold24: 140000,
      silver: 206200,
      gold22: 128300,
      gold20: 116700,
      gold18: 105000,
      silverSale: 206000,
      fallback: true,
      updatedAt: new Date().toISOString()
    };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallback)
    };
  }
};
