import { logger } from "./logger";

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.exception("storage.readJson", e, { key });
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.exception("storage.writeJson", e, { key });
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    logger.exception("storage.removeKey", e, { key });
  }
}
