import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

function isValidToken(token: string | null | undefined): token is string {
  return typeof token === "string" && token.length > 20 && token.includes(".");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const fromStorage = localStorage.getItem(TOKEN_KEY);
  if (isValidToken(fromStorage)) return fromStorage;

  const fromCookie = Cookies.get(TOKEN_KEY);
  if (isValidToken(fromCookie)) {
    localStorage.setItem(TOKEN_KEY, fromCookie);
    return fromCookie;
  }

  return null;
}

export function setAccessToken(token: string): void {
  if (!isValidToken(token)) return;

  localStorage.setItem(TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, {
    expires: 1,
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null;
}
