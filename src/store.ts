/** Keep the streets of an area on the device (IndexedDB). Key: the OSM relation id. */

const DB_NAME = "street-quiz";
const STORE = "areas";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => {
          db.close();
          resolve(request.result);
        };
        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      }),
  );
}

/** Save the GeoJSON of an area. Do nothing when IndexedDB fails (private mode). */
export async function saveArea(relation: number, geojson: unknown): Promise<void> {
  try {
    await run("readwrite", (store) => store.put(geojson, relation));
  } catch {
    // No store: the app works without it.
  }
}

/** Load the GeoJSON of an area: undefined when absent or when IndexedDB fails. */
export async function loadArea(relation: number): Promise<unknown | undefined> {
  try {
    return await run("readonly", (store) => store.get(relation));
  } catch {
    return undefined;
  }
}
