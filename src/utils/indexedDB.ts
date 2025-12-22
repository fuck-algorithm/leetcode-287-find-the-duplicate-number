import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface AlgorithmVisualizerDB extends DBSchema {
  settings: {
    key: string;
    value: {
      key: string;
      value: string | number;
      updatedAt: number;
    };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: unknown;
      expireAt: number;
    };
  };
}

let dbInstance: IDBPDatabase<AlgorithmVisualizerDB> | null = null;

async function getDB(): Promise<IDBPDatabase<AlgorithmVisualizerDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<AlgorithmVisualizerDB>('algorithm-visualizer', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    },
  });
  
  return dbInstance;
}

// 保存设置
export async function saveSetting(key: string, value: string | number): Promise<void> {
  const db = await getDB();
  await db.put('settings', {
    key,
    value,
    updatedAt: Date.now(),
  });
}

// 获取设置
export async function getSetting(key: string): Promise<string | number | null> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value ?? null;
}

// 保存缓存（带过期时间）
export async function saveCache(key: string, data: unknown, ttlMs: number): Promise<void> {
  const db = await getDB();
  await db.put('cache', {
    key,
    data,
    expireAt: Date.now() + ttlMs,
  });
}

// 获取缓存
export async function getCache<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const result = await db.get('cache', key);
  
  if (!result) return null;
  
  // 检查是否过期
  if (Date.now() > result.expireAt) {
    // 过期了，但仍然返回数据作为fallback
    return result.data as T;
  }
  
  return result.data as T;
}

// 检查缓存是否有效（未过期）
export async function isCacheValid(key: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.get('cache', key);
  
  if (!result) return false;
  return Date.now() <= result.expireAt;
}
