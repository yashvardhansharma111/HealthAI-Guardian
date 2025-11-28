const RATE_LIMIT = 10; // max requests
const WINDOW_MS = 1 * 60 * 1000; // 1 minutes

interface ClientRecord {
  count: number;
  startTime: number;
}

const clients = new Map<string, ClientRecord>();

export function rateLimit(ip: string) {
  const now = Date.now();
  const record = clients.get(ip);

  if (!record) {
    clients.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  // Reset window
  if (now - record.startTime > WINDOW_MS) {
    clients.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  // Increment count
  record.count++;

  if (record.count > RATE_LIMIT) {
    return {
      success: false,
      retryAfter: Math.ceil((WINDOW_MS - (now - record.startTime)) / 1000),
    };
  }

  return { success: true };
}
