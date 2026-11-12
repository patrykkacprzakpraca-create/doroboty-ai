import { initialState, stateSchema, type State } from "./model";
export const STORAGE_KEY = "doroboty.prototype.v1";
export const MAX_IMPORT_BYTES = 2_000_000;
const STORAGE_WRITE_FAILURE =
  "Nie udało się zapisać zmian w przeglądarce. Wyeksportuj dane przed zamknięciem strony.";
const STORAGE_CONFLICT =
  "Zapis scenariusza zmienił się w innej karcie. Twoje zmiany są w tej karcie. Wyeksportuj je przed odświeżeniem, aby zachować kopię.";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function parseState(raw: string): State {
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    throw new Error("Plik jest za duży (maksymalnie 2 MB).");
  try {
    return stateSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      "Nieprawidłowy plik lub nieobsługiwana wersja danych. Dotychczasowy stan pozostaje bez zmian.",
    );
  }
}
export function serializeState(state: State) {
  return JSON.stringify(state, null, 2);
}
export function readState(storage: StoragePort | null) {
  if (!storage)
    return {
      state: initialState(),
      issue:
        "Zapis w przeglądarce jest niedostępny. Zmiany zachowasz przez eksport w ustawieniach.",
      blocked: false,
      original: null,
      raw: null,
    };
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    return {
      state: raw ? parseState(raw) : initialState(),
      issue: "",
      blocked: false,
      original: null,
      raw,
    };
  } catch {
    return {
      state: initialState(),
      issue:
        "Nie udało się odczytać zapisu. Dotychczasowe dane nie zostaną nadpisane. Pobierz je w ustawieniach, a następnie zaimportuj poprawny plik lub zresetuj scenariusz.",
      blocked: true,
      original: raw,
      raw,
    };
  }
}
export function saveState(storage: StoragePort | null, state: State, expected: string | null) {
  if (!storage)
    throw new Error(
      "Zapis w przeglądarce jest niedostępny. Wyeksportuj zmiany przed zamknięciem strony.",
    );
  const raw = serializeState(state);
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    throw new Error("Dane przekraczają 2 MB. Wyeksportuj je, aby zachować zmiany.");
  let saved: string | null;
  try {
    saved = storage.getItem(STORAGE_KEY);
  } catch {
    throw new Error(STORAGE_WRITE_FAILURE);
  }
  if (saved !== expected) throw new Error(STORAGE_CONFLICT);
  try {
    storage.setItem(STORAGE_KEY, raw);
  } catch {
    throw new Error(STORAGE_WRITE_FAILURE);
  }
  return raw;
}
