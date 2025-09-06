// File: src/shared/lib/cache.service.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'acytel-audio-cache';
const STORE_NAME = 'audioTracks';
const DB_VERSION = 2;

interface AcytelDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: ArrayBuffer;
  };
}

let dbPromise: Promise<IDBPDatabase<AcytelDBSchema>> | null = null;

const getDb = (): Promise<IDBPDatabase<AcytelDBSchema>> => {
    if (!dbPromise) {
        dbPromise = openDB<AcytelDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
};

export async function storeTrack(trackId: string, data: ArrayBuffer): Promise<void> {
    const db = await getDb();
    await db.put(STORE_NAME, data, trackId);
}

export async function getTrack(trackId: string): Promise<ArrayBuffer | undefined> {
    const db = await getDb();
    return db.get(STORE_NAME, trackId);
}

// Initialize the database connection on application load.
getDb();