// In dev, use relative paths and Vite proxy to avoid CORS
const API_BASE = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE || "";

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

export const geminiApi = async ({ prompt, apiKey, model }) => {
  const host = "https://generativelanguage.googleapis.com";
  const chosenModel =
    model || import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash-latest";

  const makeCall = async (versionPath, modelName) => {
    const endpoint = `${host}/${versionPath}/models/${modelName}:generateContent`;
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
    const data = await res
      .json()
      .catch(async () => ({ error: { message: await res.text() } }));
    return { ok: res.ok, status: res.status, data, versionPath, modelName };
  };

  // Try v1beta first, then fall back to v1 if model not found
  const first = await makeCall("v1beta", chosenModel);
  if (first.ok) {
    return {
      text: first.data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
      modelUsed: chosenModel,
      versionUsed: "v1beta",
    };
  }
  const notFound =
    first.data?.error?.status === "NOT_FOUND" || first.status === 404;
  if (notFound) {
    // Try v1
    const second = await makeCall("v1", chosenModel);
    if (second.ok) {
      return {
        text: second.data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
        modelUsed: chosenModel,
        versionUsed: "v1",
      };
    }
    // If still not found, fetch models and pick a supported one
    const listRes = await fetch(`${host}/v1beta/models?key=${apiKey}`);
    const list = await listRes.json().catch(() => ({}));
    const models = list?.models || list?.data || [];
    const preferred = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash-001",
      "gemini-1.0-pro",
      "gemini-pro",
    ];
    const supportsGenerate = (m) => {
      const methods =
        m?.supportedGenerationMethods || m?.supportedMethods || [];
      return Array.isArray(methods)
        ? methods.includes("generateContent")
        : true;
    };
    const pick =
      models.find(
        (m) =>
          preferred.includes(m?.name?.split("/").pop()) && supportsGenerate(m)
      ) || models.find((m) => supportsGenerate(m));
    const pickedName = pick?.name?.split("/").pop();
    if (pickedName) {
      const third = await makeCall("v1beta", pickedName);
      if (third.ok) {
        return {
          text: third.data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
          modelUsed: pickedName,
          versionUsed: "v1beta",
        };
      }
      throw new Error(
        third.data?.error?.message || third.data?.message || "Model call failed"
      );
    }
    const message =
      second.data?.error?.message ||
      second.data?.message ||
      "Model not available";
    throw new Error(message);
  }
  const message =
    first.data?.error?.message ||
    first.data?.message ||
    "Gemini request failed";
  throw new Error(message);
};
