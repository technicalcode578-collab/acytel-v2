import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'acytel-audio-cache';
const STORE_NAME = 'audioTracks';
const DB_VERSION = 2; // We are incrementing the version to force an upgrade

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
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`[Cache] Upgrading DB from version ${oldVersion} to ${newVersion}`);
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    console.log(`[Cache] Creating object store: ${STORE_NAME}`);
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
};


export async function storeTrack(trackId: string, data: ArrayBuffer): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, data, trackId);
    console.log(`[Cache] Successfully stored track: ${trackId}`);
  } catch (error) {
    console.error(`[Cache] Failed to store track ${trackId}:`, error);
    throw error; // Re-throw to see it in the calling function
  }
}

export async function getTrack(trackId: string): Promise<ArrayBuffer | undefined> {
  try {
    const db = await getDb();
    const data = await db.get(STORE_NAME, trackId);
    if (data) {
      console.log(`[Cache] Cache HIT for track: ${trackId}`);
    } else {
      console.log(`[Cache] Cache MISS for track: ${trackId}`);
    }
    return data;
  } catch (error) {
    console.error(`[Cache] Failed to retrieve track ${trackId}:`, error);
    throw error;
  }
}

export async function hasTrack(trackId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const count = await db.count(STORE_NAME, trackId);
    return count > 0;
  } catch (error) {
    console.error(`[Cache] Failed to check for track ${trackId}:`, error);
    return false;
  }
}

// Call this once when the application starts to ensure the DB is ready.
getDb();