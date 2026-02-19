/**
 * beforeunloadGuard.ts
 *
 * Problem: @convex-dev/auth registers a `beforeunload` listener that calls
 * e.preventDefault() + sets e.returnValue when isRefreshingToken is true.
 * Firefox ignores stopImmediatePropagation() for beforeunload — all listeners
 * always run — so we can't block it from capture phase.
 *
 * Solution: Patch window.addEventListener at module-load time to track every
 * beforeunload listener. Before OAuth navigation, removeAll() detaches them all.
 * They are re-attached after pagehide (navigation complete) so nothing breaks
 * if the user hits Back or if an error occurs.
 *
 * This module must be imported before any library code runs, i.e. as the very
 * first import in index.tsx.
 */

type ListenerEntry = {
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
};

const tracked: ListenerEntry[] = [];
const originalAdd = window.addEventListener.bind(window);
const originalRemove = window.removeEventListener.bind(window);

// Patch addEventListener to intercept beforeunload registrations.
window.addEventListener = function patchedAddEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  if (type === "beforeunload" && listener) {
    tracked.push({ listener, options });
  }
  return originalAdd(type, listener, options as any);
};

// Patch removeEventListener to keep tracked list in sync.
window.removeEventListener = function patchedRemoveEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
) {
  if (type === "beforeunload") {
    const idx = tracked.findIndex((e) => e.listener === listener);
    if (idx !== -1) tracked.splice(idx, 1);
  }
  return originalRemove(type, listener, options as any);
};

/**
 * Remove all tracked beforeunload listeners from the window.
 * Returns a restore function that re-adds them.
 * The restore function is also automatically called on `pagehide` (once).
 */
export function suppressAllBeforeunloadListeners(): () => void {
  // Take a snapshot and detach every tracked listener.
  const snapshot = [...tracked];
  for (const { listener, options } of snapshot) {
    originalRemove("beforeunload", listener, options as any);
    // Remove from tracked so our patched removeEventListener doesn't double-splice.
    const idx = tracked.findIndex((e) => e.listener === listener);
    if (idx !== -1) tracked.splice(idx, 1);
  }

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    originalRemove("pagehide", onPageHide);
    for (const { listener, options } of snapshot) {
      originalAdd("beforeunload", listener, options as any);
      tracked.push({ listener, options });
    }
  };

  // Auto-restore on pagehide so that if user presses Back the listeners work again.
  const onPageHide = () => restore();
  originalAdd("pagehide", onPageHide, { once: true });

  return restore;
}
