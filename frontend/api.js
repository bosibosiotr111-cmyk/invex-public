const API_BASE = "https://invex-public.onrender.com";

// ===== TOKEN =====
function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}

// ===== GENERIC API REQUEST =====
async function apiRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ===== AUTH =====
async function register(email, password) {
  return apiRequest("/api/users/register", { method: "POST", body: { email, password } });
}

async function login(email, password) {
  const data = await apiRequest("/api/users/login", { method: "POST", body: { email, password } });
  if (data.token) setToken(data.token);
  return data;
}

// ===== PORTFOLIO =====
async function getPortfolio(email) {
  return apiRequest(`/api/portfolio/${email}`, { auth: true });
}

async function updatePortfolio(email, portfolio) {
  return apiRequest(`/api/portfolio/${email}`, { method: "POST", auth: true, body: portfolio });
}
