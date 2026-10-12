/**
 * Centralized API service for the Learnexa frontend.
 *
 * The backend (Flask + MongoDB + Ollama) is expected at VITE_API_URL.
 * Every screen talks to the backend only through this module, so swapping
 * mock data for live data is a one-file change per resource.
 */

export const API_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

const TOKEN_KEY = "learnexa.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export type AuthUser = { id: string; name: string; email: string; role: "learner" | "institution" };

const USER_KEY = "learnexa.user";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  setToken(token);
  if (typeof window !== "undefined") window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  setToken(null);
  if (typeof window !== "undefined") window.localStorage.removeItem(USER_KEY);
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "L"
  );
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const token = getToken();

  const init: RequestInit = {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  };
  if (isFormData) init.body = body as FormData;
  else if (body != null) init.body = JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Cannot reach the Learnexa server. Please check that the backend is running.",
      0,
    );
  }

  if (!response.ok) {
    if (response.status === 401 && token) clearSession(); // expired / invalid session
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string; error?: string };
      message = data.message ?? data.error ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => apiRequest<T>(path, { method: "POST", body: form }),
};

/** Endpoint map — keeps REST paths in one place for the Flask backend. */
export const endpoints = {
  auth: {
    login: "/auth/login",
    registerLearner: "/auth/register/learner",
    registerInstitution: "/auth/register/institution",
    me: "/auth/me",
  },
  dashboard: "/learner/dashboard",
  documents: "/documents",
  chat: "/tutor/chat",
  pdfChat: (id: string) => `/documents/${id}/chat`,
  summary: (id: string) => `/documents/${id}/summary`,
  notes: "/notes",
  flashcards: "/flashcards",
  quiz: "/quiz",
  voice: "/tutor/voice",
  imageQuestion: "/tutor/image",
  studyPlan: "/study-plan",
  revision: "/revision",
  analytics: "/analytics",
  recommendations: "/recommendations",
  chatHistory: "/tutor/history",
  chatSession: (id: string) => `/tutor/history/${id}`,
  profile: "/profile",
  institution: {
    dashboard: "/institution/dashboard",
    students: "/institution/students",
    teachers: "/institution/teachers",
    courses: "/institution/courses",
    materials: "/institution/materials",
    progress: "/institution/progress",
    analytics: "/institution/analytics",
  },
} as const;
