import { useState, useEffect, useCallback } from "react";
import { adminLogin, adminMe } from "../lib/api";

const STORAGE_KEY = "ph_admin_token";
const storage = typeof window !== "undefined" ? window.sessionStorage : null;

export default function useAdminAuth() {
  const [token, setToken] = useState(() => storage?.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(!!token);

  const clear = useCallback(() => {
    storage?.removeItem(STORAGE_KEY);
    setToken("");
    setUser(null);
    setAuthed(false);
  }, []);

  /** Log in with email + password. Returns true on success. */
  const login = useCallback(async (email, password) => {
    try {
      const { token: t, user: u } = await adminLogin(email, password);
      storage?.setItem(STORAGE_KEY, t);
      setToken(t);
      setUser(u);
      setAuthed(true);
      return true;
    } catch (e) {
      clear();
      throw e;
    }
  }, [clear]);

  // On mount: silently validate any existing token
  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    (async () => {
      try {
        const me = await adminMe(token);
        if (!cancelled) { setUser(me); setAuthed(true); }
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { token, user, authed, checking, login, logout: clear };
}
