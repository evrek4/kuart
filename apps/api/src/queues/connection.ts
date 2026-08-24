import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

/**
 * Redis bağlantısını kontrol eder.
 * Redis yoksa null döner ve BullMQ hiç başlatılmaz.
 * Bu sayede ECONNREFUSED log flooding tamamen önlenir.
 */
let _redisConnection: any = null;
let _redisChecked = false;

export async function getRedisConnection(): Promise<any | null> {
  if (_redisChecked) return _redisConnection;
  _redisChecked = true;

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const url = new URL(redisUrl);
    const isTls = url.protocol === 'rediss:';
    const host = url.hostname || '127.0.0.1';
    const port = parseInt(url.port || (isTls ? '6379' : '6379'), 10);

    await new Promise<void>((resolve, reject) => {
      if (isTls) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tls = require('tls');
        const socket = tls.connect(port, host, { servername: host }, () => {
          socket.destroy();
          resolve();
        });
        socket.setTimeout(2500);
        socket.on('error', reject);
        socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const net = require('net');
        const socket = new net.Socket();
        socket.setTimeout(1500);
        socket.on('connect', () => { socket.destroy(); resolve(); });
        socket.on('error', reject);
        socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
        socket.connect(port, host);
      }
    });

    // Redis ulaşılabilir — IORedis bağlantısı oluştur
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require('ioredis');
    _redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });

    _redisConnection.on('error', (err: Error) => {
      const code = (err as any).code;
      if (code !== 'ECONNREFUSED') {
        console.error('[Redis] Beklenmeyen hata:', err.message);
      }
    });

    console.log('[Redis] Bağlantı başarıyla kuruldu.');
    return _redisConnection;
  } catch {
    console.log('[Redis] Sunucu bulunamadı — BullMQ/Worker devre dışı. Tüm diğer API fonksiyonları çalışıyor.');
    return null;
  }
}

// Bellek içi yedek depolama (Redis kapalıyken OTP vb. çalışabilmesi için)
const inMemoryStore = new Map<string, string>();

// Geriye dönük uyumluluk için sync export (eski kodlar import ediyorsa)
export const redisConnection: any = new Proxy({} as any, {
  get: (_target, prop) => {
    // Eğer gerçek bir Redis bağlantısı varsa onu kullan
    if (_redisConnection) {
      const val = _redisConnection[prop];
      if (typeof val === 'function') {
        return val.bind(_redisConnection);
      }
      return val;
    }

    // Sessizce null/noop döndür veya bellekte sakla (InMemory Fallback)
    if (prop === 'connect') return () => Promise.resolve();
    if (prop === 'on') return () => {};
    if (prop === 'disconnect') return () => {};
    
    if (prop === 'set') {
      return (key: string, value: string) => {
        inMemoryStore.set(key, value);
        return Promise.resolve('OK');
      };
    }
    if (prop === 'get') {
      return (key: string) => {
        return Promise.resolve(inMemoryStore.get(key) || null);
      };
    }
    if (prop === 'del') {
      return (key: string) => {
        const deleted = inMemoryStore.delete(key);
        return Promise.resolve(deleted ? 1 : 0);
      };
    }
    return undefined;
  }
});
