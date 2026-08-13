import Redis from "ioredis";

/**
 * Redis cache yardımcısı. Redis kapalıysa her şey sessizce çalışmaya devam eder
 * (cache miss gibi davranır) — site asla Redis'e bağımlı çökmez.
 */

let client: Redis | null = null;

function getRedis(): Redis | null {
  if (client) return client;
  try {
    client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    client.on("error", () => {
      /* sessiz — uygulama Redis olmadan da çalışır */
    });
  } catch {
    client = null;
  }
  return client;
}

async function ready(c: Redis): Promise<boolean> {
  try {
    if (c.status === "wait") await c.connect();
    return c.status === "ready";
  } catch {
    return false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = getRedis();
  if (!c || !(await ready(c))) return null;
  try {
    const v = await c.get(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const c = getRedis();
  if (!c || !(await ready(c))) return;
  try {
    await c.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    /* yoksay */
  }
}

/** Sorted set üyesini artır (okunma sayacı). */
export async function zincr(key: string, member: string, by = 1): Promise<void> {
  const c = getRedis();
  if (!c || !(await ready(c))) return;
  try {
    await c.zincrby(key, by, member);
  } catch {
    /* yoksay */
  }
}

/** Sorted set'in en yüksek skorlu ilk n üyesi (skor sırasına göre). */
export async function ztop(key: string, n: number): Promise<string[]> {
  const c = getRedis();
  if (!c || !(await ready(c))) return [];
  try {
    return await c.zrevrange(key, 0, Math.max(0, n - 1));
  } catch {
    return [];
  }
}

/** Set'e üye ekle (bülten e-postaları vb.). Eklenen yeni üye sayısını döndürür. */
export async function sadd(key: string, member: string): Promise<number> {
  const c = getRedis();
  if (!c || !(await ready(c))) return 0;
  try {
    return await c.sadd(key, member);
  } catch {
    return 0;
  }
}

/** Redis destekli memoize: önce cache'e bakar, yoksa fn() çalıştırıp yazar. */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const fresh = await fn();
  if (fresh != null) await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
