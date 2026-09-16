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

  const reqHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  // Strategy 1: Fetch direct real Indian MCX exchange tick data
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const [goldRes, silverRes] = await Promise.all([
      fetch("https://economictimes.indiatimes.com/commoditysummary/symbol-GOLD.cms", { headers: reqHeaders, signal: controller.signal }),
      fetch("https://economictimes.indiatimes.com/commoditysummary/symbol-SILVER.cms", { headers: reqHeaders, signal: controller.signal })
    ]);
    clearTimeout(timeoutId);

    const goldHtml = await goldRes.text();
    const silverHtml = await silverRes.text();

    const goldMatch = goldHtml.match(/class="commodityPrice">([0-9.]+)</);
    const silverMatch = silverHtml.match(/class="commodityPrice">([0-9.]+)</);

    if (goldMatch && silverMatch) {
      const gold24 = Math.round(parseFloat(goldMatch[1]));
      const silverKg = parseFloat(silverMatch[1]);
      const silver10g = Math.round(silverKg / 100);
      const silverSale10g = Math.round(silver10g - 250);

      const payload = {
        success: true,
        source: "real_mcx_exchange",
        gold24: gold24,
        silver10g: silver10g,
        silver: Math.round(silverKg),
        gold22: Math.round(gold24 * 22 / 24),
        gold20: Math.round(gold24 * 20 / 24),
        gold18: Math.round(gold24 * 18 / 24),
        silverSale: silverSale10g,
        updatedAt: new Date().toISOString()
      };

      cachedData = payload;
      lastFetchTime = now;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(payload)
      };
    }
  } catch (err) {
    console.warn("Direct MCX fetch skipped/failed, trying spot calculation:", err.message);
  }

  // Strategy 2: Spot Bullion conversion with calibrated MCX futures factor (~1.136)
  try {
    const [goldRes, silverRes, inrRes] = await Promise.all([
      fetch("https://api.gold-api.com/price/XAU"),
      fetch("https://api.gold-api.com/price/XAG"),
      fetch("https://open.er-api.com/v6/latest/USD")
    ]);

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    const inrData = await inrRes.json();

    const usdinr = (inrData && inrData.rates && inrData.rates.INR) ? inrData.rates.INR : 95.91;
    const goldUsd = (goldData && goldData.price) ? goldData.price : 4320.0;
    const silverUsd = (silverData && silverData.price) ? silverData.price : 63.5;

    const rawGold10g = (goldUsd / 31.1034768) * 10 * usdinr;
    const gold24 = Math.round(rawGold10g * 1.136);

    const rawSilver10g = (silverUsd / 31.1034768) * 10 * usdinr;
    const silver10g = Math.round(rawSilver10g * 1.21);
    const silverSale10g = Math.round(silver10g - 250);

    const payload = {
      success: true,
      source: "spot_fallback",
      gold24: gold24,
      silver10g: silver10g,
      silver: silver10g * 100,
      gold22: Math.round(gold24 * 22 / 24),
      gold20: Math.round(gold24 * 20 / 24),
      gold18: Math.round(gold24 * 18 / 24),
      silverSale: silverSale10g,
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
      source: "static_fallback",
      gold24: 151500,
      silver10g: 2350,
      silver: 235000,
      gold22: 138875,
      gold20: 126250,
      gold18: 113625,
      silverSale: 2100,
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
