// export const API_BASE = "http://192.168.1.6:4000";

export const API_BASE = "https://thetestpulse.com";


// export const API_BASE = "http://10.30.104.198:4000";


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

export const logoutUser = async () => {
  try {
    const res = await apiFetch('/auth/logout', {
      method: 'POST',
      credentials: 'include' // Important for session/cookie-based auth
    });
    return await res.json();
  } catch (error) {
    throw new Error('Logout failed');
  }
};