import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    correo: location.state?.correo || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mensajeRegistroExitoso = location.state?.registrado
    ? "Cuenta creada exitosamente. Ahora puedes iniciar sesión."
    : "";

  // Limpiar estados de error al escribir nuevamente en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError("");
    }
  };

  const validarFormulario = () => {
    const correoLimpio = formData.correo.trim();
    if (!correoLimpio || !EMAIL_REGEX.test(correoLimpio)) {
      setError("Por favor, ingresa un correo electrónico con formato válido.");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("La contraseña es obligatoria y debe tener al menos 8 caracteres.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!validarFormulario()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(formData.correo.trim().toLowerCase(), formData.password);
      const destino = location.state?.from?.pathname || "/productos";
      navigate(destino, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError(
          err.message || "No fue posible iniciar sesión. Intenta nuevamente."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 12px 32px rgba(35, 54, 26, 0.16)",
          border: "1.5px solid #A2B447",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "6px",
            background: "linear-gradient(90deg, #23361A 0%, #556F30 35%, #A2B447 70%, #516F7A 100%)",
          }}
        />

        <div style={{ padding: "32px 28px" }}>
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "#EFF4BD",
                border: "1px solid #A2B447",
                color: "#23361A",
                fontSize: "12px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              Acceso Empresarial · JWT
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 800,
                color: "#23361A",
              }}
            >
              Iniciar Sesión
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#516F7A" }}>
              Ingresa tus credenciales para gestionar el catálogo ArtSupply Pro
            </p>
          </div>

          {mensajeRegistroExitoso && !error && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "#EFF4BD",
                border: "1.5px solid #556F30",
                color: "#23361A",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {mensajeRegistroExitoso}
            </div>
          )}

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "#362F22",
                border: "1.5px solid #A2B447",
                color: "#EFF4BD",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="login-correo"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#23361A",
                }}
              >
                Correo Electrónico *
              </label>
              <input
                id="login-correo"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="operador@artsupplypro.com"
                autoComplete="email"
                disabled={submitting}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #556F30",
                  fontSize: "14px",
                  color: "#23361A",
                }}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#23361A",
                }}
              >
                Contraseña *
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="current-password"
                disabled={submitting}
                required
                minLength={8}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #556F30",
                  fontSize: "14px",
                  color: "#23361A",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: submitting
                  ? "#516F7A"
                  : "linear-gradient(135deg, #23361A 0%, #556F30 100%)",
                color: "#EFF4BD",
                fontSize: "14px",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(35, 54, 26, 0.25)",
              }}
            >
              {submitting ? "Verificando credenciales..." : "Entrar al Panel"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              paddingTop: "16px",
              borderTop: "1px solid #EFF4BD",
              textAlign: "center",
              fontSize: "13.5px",
              color: "#362F22",
            }}
          >
            ¿Aún no tienes cuenta?{" "}
            <Link
              to="/registro"
              style={{
                color: "#556F30",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Ir al registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

