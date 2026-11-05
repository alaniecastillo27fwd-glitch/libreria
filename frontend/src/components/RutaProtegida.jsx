import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutaProtegida = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mientras se verifica la sesión inicial en localStorage (/api/auth/me), mostrar estado de carga
  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#23361A",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "4px solid #EFF4BD",
            borderTopColor: "#556F30",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>
          Verificando sesión de seguridad...
        </span>
      </div>
    );
  }

  // Si no está autenticado tras finalizar la comprobación, redirigir a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RutaProtegida;

