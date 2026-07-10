import { cached } from "./redis";

export type Finance = {
  usd?: string;
  eur?: string;
  gbp?: string;
  gold?: string;
  goldOz?: string;
  bist?: string;
  bistChange?: string;
  btc?: string;
  eth?: string;
};

async function safeJson(url: string, headers?: Record<string, string>): Promise<any> {
  try {
    const r = await fetch(url, { headers, next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** Dolar, Euro, Gram Altın, BİST 100 — 10 dakika Redis cache. */
export async function getFinance(): Promise<Finance> {
  return cached("finance:data", 600, async () => {
    const out: Finance = {};

    // Dolar / Euro / Sterlin (Frankfurter: 1 TRY = x → tersini al)
    const fx = await safeJson("https://api.frankfurter.app/latest?from=TRY&to=USD,EUR,GBP");
    if (fx?.rates?.USD) out.usd = (1 / fx.rates.USD).toFixed(2);
    if (fx?.rates?.EUR) out.eur = (1 / fx.rates.EUR).toFixed(2);
    if (fx?.rates?.GBP) out.gbp = (1 / fx.rates.GBP).toFixed(2);

    // Altın (XAU USD/ons → gram TRY ve ons USD)
    const gold = await safeJson("https://api.gold-api.com/price/XAU");
    if (gold?.price) {
      out.goldOz = "$" + Math.round(gold.price).toLocaleString("en-US");
      if (out.usd) {
        const gram = (gold.price / 31.1035) * parseFloat(out.usd);
        out.gold = Math.round(gram).toLocaleString("tr-TR");
      }
    }

    // Kripto (Coinbase spot USD → TRY)
    if (out.usd) {
      const usd = parseFloat(out.usd);
      const btc = await safeJson("https://api.coinbase.com/v2/prices/BTC-USD/spot");
      if (btc?.data?.amount) out.btc = Math.round(parseFloat(btc.data.amount) * usd).toLocaleString("tr-TR");
      const eth = await safeJson("https://api.coinbase.com/v2/prices/ETH-USD/spot");
      if (eth?.data?.amount) out.eth = Math.round(parseFloat(eth.data.amount) * usd).toLocaleString("tr-TR");
    }

    // BİST 100
    const bist = await safeJson(
      "https://query1.finance.yahoo.com/v8/finance/chart/XU100.IS?interval=1d&range=5d",
      { "User-Agent": "Mozilla/5.0" },
    );
    const meta = bist?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice) {
      out.bist = Math.round(meta.regularMarketPrice).toLocaleString("tr-TR");
      if (meta.chartPreviousClose) {
        const ch = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100;
        out.bistChange = (ch >= 0 ? "+" : "") + ch.toFixed(2);
      }
    }

    return out;
  });
}
