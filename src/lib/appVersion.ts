/**
 * Pages and the report export are loaded on demand from files whose names change
 * with every deployment. A tab opened before a deployment still asks for the old
 * files, which no longer exist; reloading picks up the new version.
 */

const RELOAD_KEY = 'pplus.reloadedForNewVersion';
/** Do not reload again within this window, so a genuinely broken file cannot loop. */
const RELOAD_GUARD_MS = 60_000;

const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|ChunkLoadError|Loading chunk \d+ failed/i;

/** True when the error means an on-demand file of an older deployment could not be loaded. */
export function isStaleVersionError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? '');
  return CHUNK_ERROR.test(message);
}

/** Reloads the page once to load the current version. Returns false if it already just did. */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    if (last && Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Without storage we cannot guard against a reload loop, so do not reload automatically.
    return false;
  }
  window.location.reload();
  return true;
}
