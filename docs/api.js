
const API_BASE = "https://invex-public.onrender.com";

// ===== GENERIC API REQUEST (cookie-based auth) =====
async function apiRequest(path, { method = "GET", body = null } = {}) {
  const headers = { "Content-Type": "application/json" };
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ===== AUTH =====
async function register({ name, email, password, phone }) {
  return apiRequest("/api/users/register", {
    method: "POST",
    body: { name, email, password, phone }
  });
}

async function login(email, password) {
  return apiRequest("/api/users/login", { method: "POST", body: { email, password } });
}

// ===== PORTFOLIO =====
async function getPortfolio(email) {
  return apiRequest(`/api/portfolios/${email}`);
}

async function updatePortfolio(email, portfolio) {
  return apiRequest(`/api/portfolios/${email}`, { method: "POST", body: portfolio });
}
