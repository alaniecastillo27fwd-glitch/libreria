const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:3000/api";

export const TOKEN_STORAGE_KEY = "artsupply_token";
export const USER_STORAGE_KEY = "artsupply_user";
export const AUTH_UNAUTHORIZED_EVENT = "artsupply:unauthorized";

// Referencia en memoria del token activo sincronizada con localStorage
let inMemoryToken =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

/**
 * Actualiza o limpia explícitamente el token en el cliente HTTP y en localStorage.
 */
export const setClientAuthToken = (nuevoToken) => {
  inMemoryToken = nuevoToken || null;
  if (typeof window !== "undefined") {
    if (nuevoToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nuevoToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
};

/**
 * Interceptor de solicitud (Request Interceptor):
 * Lee siempre el token vigente (memoria/localStorage) e inyecta 'Authorization: Bearer <token>'.
 * Si no hay token activo, elimina cualquier cabecera Authorization residual.
 */
const applyRequestInterceptor = (options = {}) => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem(TOKEN_STORAGE_KEY)) ||
    inMemoryToken;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    delete headers.Authorization;
    delete headers.authorization;
  }

  return {
    ...options,
    headers,
  };
};

/**
 * Interceptor de respuesta (Response Interceptor):
 * Inspecciona el código HTTP. Si recibe 401 en una ruta privada (excluyendo /auth/login y /auth/register),
 * limpia el token y notifica a AuthContext mediante evento global sin causar bucles infinitos.
 */
const applyResponseInterceptor = async (response, endpoint) => {
  const isPublicAuthEndpoint =
    endpoint.includes("/auth/login") || endpoint.includes("/auth/register");

  if (response.status === 401 && !isPublicAuthEndpoint) {
    inMemoryToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);

      // Notificar reactivamente al AuthContext para limpiar el estado de React
      // y permitir que <RutaProtegida> redirija limpiamente a /login
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const mensajeError =
      data?.error ||
      data?.mensaje ||
      data?.message ||
      (Array.isArray(data?.detalles) ? data.detalles.join(" ") : null) ||
      `Error HTTP ${response.status}`;

    const error = new Error(mensajeError);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Cliente de red centralizado con interceptores de Request y Response.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const interceptedOptions = applyRequestInterceptor(options);

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, interceptedOptions);
  return applyResponseInterceptor(response, normalizedEndpoint);
};

const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),
};

export default api;
