import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api, {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  AUTH_UNAUTHORIZED_EVENT,
  setClientAuthToken,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(USER_STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Función centralizada para cerrar sesión: limpia storage local, cliente HTTP y estado React
  const logout = useCallback(() => {
    setClientAuthToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  // Escuchar eventos 401 del interceptor y sincronización multi-pestaña (storage event)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const handleStorageChange = (event) => {
      if (event.key === TOKEN_STORAGE_KEY && !event.newValue) {
        logout();
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  // Verificar validez del token almacenado al refrescar el navegador (F5) contra GET /api/auth/me
  // Incluye AbortController y bandera isMounted para evitar Memory Leaks y Race Conditions
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const verificarSesionInicial = async () => {
      const tokenAlmacenado = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!tokenAlmacenado) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        setClientAuthToken(tokenAlmacenado);
        const perfil = await api.get("/auth/me", {
          signal: abortController.signal,
        });

        if (isMounted) {
          setUsuario(perfil);
          setToken(tokenAlmacenado);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(perfil));
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        // Si el token venció o es inválido (401), o si no hay usuario en caché, limpiar sesión
        if (isMounted) {
          if (error.status === 401 || !localStorage.getItem(USER_STORAGE_KEY)) {
            logout();
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verificarSesionInicial();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [logout]);

  // Iniciar sesión contra POST /api/auth/login
  const login = useCallback(async (correo, password) => {
    const respuesta = await api.post("/auth/login", { correo, password });
    const { token: nuevoToken, usuario: datosUsuario } = respuesta;

    setClientAuthToken(nuevoToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, nuevoToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(datosUsuario));

    setToken(nuevoToken);
    setUsuario(datosUsuario);

    return datosUsuario;
  }, []);

  // Registrar nuevo usuario contra POST /api/auth/register
  const register = useCallback(async (nombre, correo, password) => {
    return await api.post("/auth/register", { nombre, correo, password });
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      token,
      isAuthenticated: Boolean(token && usuario),
      loading,
      login,
      register,
      logout,
    }),
    [usuario, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un <AuthProvider>");
  }
  return context;
};

export default AuthContext;
