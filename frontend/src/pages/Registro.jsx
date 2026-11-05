import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const Registro = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Limpiar o resetear los estados de error al escribir nuevamente en los inputs
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
    const nombreLimpio = formData.nombre.trim();
    const correoLimpio = formData.correo.trim();

    if (!nombreLimpio || nombreLimpio.length < 2) {
      setError("El nombre completo es obligatorio (mínimo 2 caracteres).");
      return false;
    }

    if (!correoLimpio || !EMAIL_REGEX.test(correoLimpio)) {
      setError("Por favor, ingresa un correo electrónico con formato válido.");
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("La contraseña debe tener un mínimo de 8 caracteres.");
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
      const correoNormalizado = formData.correo.trim().toLowerCase();
      await register(
        formData.nombre.trim(),
        correoNormalizado,
        formData.password
      );

      // Redirigir a /login tras un registro exitoso (201)
      navigate("/login", {
        replace: true,
        state: {
          registrado: true,
          correo: correoNormalizado,
        },
      });
    } catch (err) {
      if (err.status === 400) {
        setError(
          err.message ||
            "El correo electrónico ya está registrado o los datos son inválidos."
        );
      } else {
        setError(
          err.message || "Error al crear la cuenta. Intenta nuevamente."
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
          maxWidth: "460px",
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
            background: "linear-gradient(90deg, #516F7A 0%, #556F30 50%, #A2B447 100%)",
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
              Alta de Operador · ArtSupply Pro
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 800,
                color: "#23361A",
              }}
            >
              Crear Cuenta
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#516F7A" }}>
              Regístrate para acceder al sistema empresarial de inventario
            </p>
          </div>

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
                htmlFor="registro-nombre"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#23361A",
                }}
              >
                Nombre Completo *
              </label>
              <input
                id="registro-nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Alanie Castillo"
                autoComplete="name"
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

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="registro-correo"
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
                id="registro-correo"
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
                htmlFor="registro-password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#23361A",
                }}
              >
                Contraseña (mínimo 8 caracteres) *
              </label>
              <input
                id="registro-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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
                  : "linear-gradient(135deg, #516F7A 0%, #556F30 50%, #23361A 100%)",
                color: "#EFF4BD",
                fontSize: "14px",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(35, 54, 26, 0.25)",
              }}
            >
              {submitting ? "Registrando usuario..." : "Crear Cuenta"}
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
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              style={{
                color: "#556F30",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;

