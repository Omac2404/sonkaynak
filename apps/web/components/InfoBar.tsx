"use client";

import { useEffect, useState } from "react";
import type { Finance } from "@/lib/finance";

const WMO: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

function Cell({ label, value, sub }: { label: string; value: string; sub?: string; icon?: string }) {
  const up = sub?.includes("+");
  const down = sub?.includes("-");
  return (
    <div className="shrink-0 px-4 py-2 leading-tight">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold text-sk-ink">{value}</span>
        {sub && (
          <span className={`text-[11px] font-semibold ${up ? "text-green-600" : down ? "text-sk-red" : "text-neutral-400"}`}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export function InfoBar({ finance }: { finance: Finance }) {
  const [weather, setWeather] = useState<{ temp: string; icon: string; city: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const w = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
        ).then((r) => r.json());
        let city = "";
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=tr`,
          ).then((r) => r.json());
          city = geo?.address?.province ?? geo?.address?.city ?? geo?.address?.town ?? "";
        } catch {}
        if (cancelled) return;
        const code = w?.current?.weather_code ?? 0;
        setWeather({
          temp: `${Math.round(w?.current?.temperature_2m ?? 0)}°`,
          icon: WMO[code] ?? "🌡️",
          city: city || "Hava",
        });
      } catch {}
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(39.85, 33.52), // Kırıkkale varsayılan
        { timeout: 5000 },
      );
    } else {
      fetchWeather(39.85, 33.52);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const bistUp = (finance.bistChange ?? "").startsWith("+");

  return (
    <div className="overflow-x-auto rounded-lg border border-sk-line bg-white">
      <div className="flex min-w-max items-stretch divide-x divide-sk-line">
        <Cell label={weather?.city ?? "Hava"} value={weather?.temp ?? "—"} icon={weather?.icon ?? "🌡️"} />
        <Cell label="Dolar" value={finance.usd ? `₺${finance.usd}` : "—"} icon="💵" />
        <Cell label="Euro" value={finance.eur ? `₺${finance.eur}` : "—"} icon="💶" />
        <Cell label="Gram Altın" value={finance.gold ? `₺${finance.gold}` : "—"} icon="🪙" />
        <Cell
          label="BİST 100"
          value={finance.bist ?? "—"}
          sub={finance.bistChange ? `%${finance.bistChange}` : undefined}
          icon={bistUp ? "📈" : "📉"}
        />
      </div>
    </div>
  );
}
