export const API_BASE = "http://192.168.240.198:4000"; // ← Replace with your LAN IP!

// export const API_BASE = "https://thetestpulse.com/";

export async function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // Needed to send/receive cookies
  });
}
