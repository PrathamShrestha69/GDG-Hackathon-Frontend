
const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_BASE || "");

export const apiFetch = async (path, options = {}, token = "") => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const clone = res.clone();

  try {
    data = await res.json();
  } catch (err) {
    // fallback to text
    const text = await clone.text();
    if (!res.ok) throw new Error(text || res.statusText);
    return text;
  }

  if (!res.ok || data?.success === false) {
    const message = data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
};

export const authApi = {
  signup: (payload) =>
    apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signin: (payload) =>
    apiFetch("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token) => apiFetch("/api/auth/me", { method: "GET" }, token),
};

export const quizApi = {
  categories: () => apiFetch("/api/categories"),
  category: (id) => apiFetch(`/api/categories/${id}`),
  questionsByCategory: (categoryId) =>
    apiFetch(`/api/questions/category/${categoryId}`),
  submit: (payload, token) =>
    apiFetch(
      "/api/quiz/submit",
      { method: "POST", body: JSON.stringify(payload) },
      token
    ),
  stats: (token) => apiFetch("/api/quiz/stats", { method: "GET" }, token),
};

export const geminiApi = async ({ prompt, apiKey }) => {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};
