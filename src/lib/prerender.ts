export const DEFAULT_PRERENDER_TIMEOUT_MS = 12_000;

type PrerenderState = {
  token: number;
  isReady: boolean;
  activeRouteKey: string;
  readyRouteKey: string | null;
  timeoutId: number | null;
};

const STATE_KEY = "__RS_PRERENDER_STATE__" as const;
const BOOTSTRAP_TIMEOUT_KEY = "__RS_PRERENDER_BOOTSTRAP_TIMEOUT_ID__" as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function ensureState(): PrerenderState {
  const w = window as any;

  if (!w[STATE_KEY]) {
    w[STATE_KEY] = {
      token: 0,
      isReady: false,
      activeRouteKey: "global",
      readyRouteKey: null,
      timeoutId: null,
    } satisfies PrerenderState;
  }

  return w[STATE_KEY] as PrerenderState;
}

function clearAnyTimeout(state: PrerenderState) {
  const w = window as any;

  if (typeof w[BOOTSTRAP_TIMEOUT_KEY] === "number") {
    window.clearTimeout(w[BOOTSTRAP_TIMEOUT_KEY]);
    w[BOOTSTRAP_TIMEOUT_KEY] = undefined;
  }

  if (typeof state.timeoutId === "number") {
    window.clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
}

export function setPrerenderBlocked(options?: {
  routeKey?: string;
  timeoutMs?: number;
}): boolean {
  if (!isBrowser()) return false;

  const routeKey = options?.routeKey || "global";
  const timeoutMs = typeof options?.timeoutMs === "number" ? options!.timeoutMs : DEFAULT_PRERENDER_TIMEOUT_MS;

  const state = ensureState();
  state.token += 1;
  state.isReady = false;
  state.activeRouteKey = routeKey;
  state.readyRouteKey = null;

  // ROT
  (window as any).prerenderReady = false;

  clearAnyTimeout(state);

  // Airbag
  if (timeoutMs > 0) {
    const token = state.token;
    state.timeoutId = window.setTimeout(() => {
      const current = ensureState();
      if (current.token != token) return; // es gab inzwischen einen neuen Block
      if (current.isReady) return;

      current.isReady = true;
      current.readyRouteKey = current.activeRouteKey;
      current.timeoutId = null;
      (window as any).prerenderReady = true;
    }, timeoutMs);

    // optional sichtbar für Debugging
    (window as any)[BOOTSTRAP_TIMEOUT_KEY] = state.timeoutId;
  }

  return true;
}

export function setPrerenderReady(routeKey?: string): boolean {
  if (!isBrowser()) return false;

  const state = ensureState();
  const normalizedRouteKey = routeKey || state.activeRouteKey || "global";

  // Idempotent: nicht mehrfach unnötig feuern
  if (state.isReady && state.readyRouteKey === normalizedRouteKey && (window as any).prerenderReady === true) {
    return false;
  }

  clearAnyTimeout(state);

  state.isReady = true;
  state.readyRouteKey = normalizedRouteKey;
  state.activeRouteKey = normalizedRouteKey;

  // GRÜN
  (window as any).prerenderReady = true;

  return true;
}
