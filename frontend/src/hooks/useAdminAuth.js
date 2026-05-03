import { useState, useEffect, useCallback } from "react";
import { verifyAdmin } from "../lib/api";

const STORAGE_KEY = "ph_admin_token";
// sessionStorage is cleared when the tab closes — much smaller XSS attack window
// than localStorage, and adequate for an MVP single-token admin gate.
const storage = typeof window !== "undefined" ? window.sessionStorage : null;

export default function useAdminAuth() {
  const [token, setToken] = useState(() => storage?.getItem(STORAGE_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(!!token);

  const persist = useCallback((t) => {
    storage?.setItem(STORAGE_KEY, t);
    setToken(t);
    setAuthed(true);
  }, []);

  const clear = useCallback(() => {
    storage?.removeItem(STORAGE_KEY);
    setToken("");
    setAuthed(false);
  }, []);

  const verify = useCallback(async (t) => {
    try {
      await verifyAdmin(t);
      persist(t);
      return true;
    } catch {
      clear();
      return false;
    }
  }, [persist, clear]);

  // On mount: silently verify any existing token
  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    (async () => {
      try {
        await verifyAdmin(token);
        if (!cancelled) setAuthed(true);
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { token, authed, checking, verify, logout: clear };
}
