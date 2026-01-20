/**
 * Small API client for the Todo backend.
 * Uses REACT_APP_API_BASE if provided, otherwise defaults to http://localhost:3001
 */

const DEFAULT_API_BASE = "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * Return the configured API base URL.
 */
export function getApiBaseUrl() {
  // CRA only exposes env vars prefixed with REACT_APP_
  const fromEnv = process.env.REACT_APP_API_BASE;
  const base = (fromEnv && String(fromEnv).trim()) ? String(fromEnv).trim() : DEFAULT_API_BASE;
  return base.replace(/\/+$/, ""); // remove trailing slashes
}

/**
 * PUBLIC_INTERFACE
 * Perform a JSON request against the API.
 * Throws an Error with a helpful message on non-2xx responses.
 */
export async function apiRequest(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Handle empty bodies (e.g., 204)
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const detail =
      (payload && typeof payload === "object" && (payload.detail || payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
