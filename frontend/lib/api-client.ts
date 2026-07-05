import type { APIResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  skipJson?: boolean;
}

/**
 * Central fetch wrapper used by every service module. Never call fetch()
 * directly from a component — go through a service in /lib/services instead.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: options.cache ?? "no-store",
  });

  let body: APIResponse<T> | null = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok || !body?.success) {
    throw new APIError(body?.error || `Request failed (${res.status})`, res.status);
  }

  return body.data as T;
}

export async function apiFetchWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta: APIResponse<T>["meta"] }> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: options.cache ?? "no-store",
  });

  const body: APIResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new APIError(body.error || `Request failed (${res.status})`, res.status);
  }

  return { data: body.data as T, meta: body.meta };
}
