const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const TOKEN_KEY = 'miniblog-token';
const USER_KEY = 'miniblog-user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};
export const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const handleRes = async (r) => {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { message: data.message || `Request failed (${r.status}). Is the server running on ${API}?` };
  }
  return data;
};

export const register = (username, email, password) =>
  fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  }).then(handleRes);

export const login = (email, password) => {
  const emailVal = email != null ? String(email).trim() : '';
  const passwordVal = password != null ? String(password) : '';
  const url = API + '/api/auth/login';
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailVal,
      password: passwordVal
    })
  }).then(handleRes);
};
