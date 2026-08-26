// apps/api/src/lib/appointmentLock.ts
//
// Redis SET NX PX tabanli Distributed Lock.
// Iki kullanici ayni personele ayni saat dilimine milisaniye farkiyla
// istek attiginda yalnizca biri lock alir; digeri 409 alir.
//
// Kullanim:
//   const lockKey = await acquireLock(staffId, startTime, durationMs);
//   if (!lockKey) return res.status(409).json({ error: 'Slot mesgul' });
//   try { /* randevu olustur */ } finally { await releaseLock(lockKey); }

import { redisConnection } from '../queues/connection';

const LOCK_PREFIX = 'lock:apt';
const BUFFER_MS  = 30_000; // 30 saniyelik tampon

/**
 * Belirli bir personel + zaman dilimi icin Redis lock alir.
 *
 * @param staffId     Personel ID
 * @param startTime   Randevu baslangic zamani (Date)
 * @param durationMs  Randevu suresi (milisaniye)
 * @returns Lock key (release icin) — lock alinamazsa null
 */
export async function acquireLock(
  staffId: string,
  startTime: Date,
  durationMs: number
): Promise<string | null> {
  // Zaman dilimini 1 dakika hassasiyetinde yuvarla
  const slotMinute = Math.floor(startTime.getTime() / 60_000);
  const key = `${LOCK_PREFIX}:${staffId}:${slotMinute}`;
  const ttlMs = durationMs + BUFFER_MS;

  // SET key 1 NX PX ttl
  const result = await redisConnection.set(key, '1', 'NX', 'PX', ttlMs);

  // result === 'OK' ise lock alindi; null ise baska biri tutmus
  return result === 'OK' ? key : null;
}

/**
 * Daha once alinan lock'u serbest birakir.
 * @param lockKey acquireLock'un dondurdugu key
 */
export async function releaseLock(lockKey: string): Promise<void> {
  try {
    await redisConnection.del(lockKey);
  } catch (err) {
    // Lock serbest birakilamasa bile TTL dolduklari otomatik kalkar.
    console.warn('[AppointmentLock] releaseLock hata (TTL ile kurtarilacak):', err);
  }
}

/**
 * Higher-order yardimci: lock alir, callback calistirir, lock'u birakir.
 * Lock alinamazsa null doner — caller 409 gondermeli.
 */
export async function withAppointmentLock<T>(
  staffId: string,
  startTime: Date,
  durationMs: number,
  fn: () => Promise<T>
): Promise<T | null> {
  const lockKey = await acquireLock(staffId, startTime, durationMs);
  if (!lockKey) return null;

  try {
    return await fn();
  } finally {
    await releaseLock(lockKey);
  }
}