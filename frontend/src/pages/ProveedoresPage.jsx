import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ESTADO_INICIAL = {
  identificacion_fiscal: "",
  nombre: "",
  contacto: "",
  telefono: "",
  correo_comercial: "",
  direccion: "",
};

const ProveedoresPage = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [exitoBanner, setExitoBanner] = useState("");

  const cargarProveedores = useCallback(async () => {
    setCargando(true);
    setErrorBanner("");
    try {
      const data = await api.get("/proveedores");
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.status !== 401) {
        setErrorBanner(error.message || "Error al cargar los proveedores.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  const handleCerrarSesion = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorBanner) setErrorBanner("");
    if (exitoBanner) setExitoBanner("");
  };

  const iniciarEdicion = (prov) => {
    setEditandoId(prov.id_proveedor);
    setFormData({
      identificacion_fiscal: prov.identificacion_fiscal || "",
      nombre: prov.nombre || "",
      contacto: prov.contacto || "",
      telefono: prov.telefono || "",
      correo_comercial: prov.correo_comercial || "",
      direccion: prov.direccion || "",
    });
    setErrorBanner("");
    setExitoBanner("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData(ESTADO_INICIAL);
    setErrorBanner("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardando) return;

    setGuardando(true);
    setErrorBanner("");
    setExitoBanner("");

    try {
      if (editandoId) {
        const actualizado = await api.put(`/proveedores/${editandoId}`, formData);
        setProveedores((prev) =>
          prev.map((p) => (p.id_proveedor === editandoId ? { ...p, ...actualizado } : p))
        );
        setExitoBanner(`Proveedor "${actualizado.nombre}" actualizado correctamente.`);
      } else {
        const creado = await api.post("/proveedores", formData);
        setProveedores((prev) => [...prev, creado]);
        setExitoBanner(`Proveedor "${creado.nombre}" registrado exitosamente.`);
      }
      setEditandoId(null);
      setFormData(ESTADO_INICIAL);
    } catch (error) {
      if (error.status !== 401) {
        setErrorBanner(error.message || "Error al guardar el proveedor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (prov) => {
    setErrorBanner("");
    setExitoBanner("");
    setProveedorAEliminar(prov);
  };

  const confirmarEliminacion = async () => {
    if (!proveedorAEliminar || eliminando) return;
    const prov = proveedorAEliminar;
    setEliminando(true);
    setErrorBanner("");
    setExitoBanner("");

    try {
      await api.delete(`/proveedores/${prov.id_proveedor}`);
      setProveedores((prev) => prev.filter((p) => p.id_proveedor !== prov.id_proveedor));
      if (editandoId === prov.id_proveedor) {
        cancelarEdicion();
      }
      setExitoBanner(`Proveedor "${prov.nombre}" eliminado exitosamente.`);
      setProveedorAEliminar(null);
    } catch (error) {
      if (error.status === 409) {
        setErrorBanner(
          error.message ||
            "Conflicto (409): No se puede eliminar el proveedor porque tiene órdenes de compra asociadas."
        );
      } else if (error.status !== 401) {
        setErrorBanner(error.message || "Error al eliminar el proveedor.");
      }
      setProveedorAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px 20px 48px", color: "#23361A" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          padding: "16px 22px",
          marginBottom: "24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #23361A 0%, #556F30 58%, #516F7A 100%)",
          color: "#EFF4BD",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#EFF4BD" }}>
            Gestión de Proveedores · ArtSupply Pro
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#EFF4BD", opacity: 0.9 }}>
            Operador: <strong>{usuario?.nombre || "Usuario Activo"}</strong> ({usuario?.correo})
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            to="/productos"
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "rgba(239, 244, 189, 0.18)",
              border: "1px solid #A2B447",
              color: "#EFF4BD",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Productos
          </Link>
          <Link
            to="/categorias"
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "rgba(239, 244, 189, 0.18)",
              border: "1px solid #A2B447",
              color: "#EFF4BD",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Categorías
          </Link>
          <button
            type="button"
            onClick={handleCerrarSesion}
            style={{
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid #EFF4BD",
              background: "#362F22",
              color: "#EFF4BD",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {errorBanner && (
        <div
          role="alert"
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#362F22",
            border: "1.5px solid #A2B447",
            color: "#EFF4BD",
            fontWeight: 600,
          }}
        >
          {errorBanner}
        </div>
      )}

      {exitoBanner && (
        <div
          role="status"
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#EFF4BD",
            border: "1.5px solid #556F30",
            color: "#23361A",
            fontWeight: 700,
          }}
        >
          {exitoBanner}
        </div>
      )}

      <section
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "28px",
          border: "1.5px solid #A2B447",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#23361A" }}>
          {editandoId ? `Editar Proveedor #${editandoId}` : "Registrar Nuevo Proveedor"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Identificación Fiscal *
              </label>
              <input
                type="text"
                name="identificacion_fiscal"
                value={formData.identificacion_fiscal}
                onChange={handleChange}
                placeholder="Ej. UK-VAT-9928172"
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #516F7A", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Razón Social / Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Winsor & Newton Ltd."
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #556F30", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Persona de Contacto *
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Ej. Arthur Pendelton"
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #556F30", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Teléfono *
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+44 20 7946 0192"
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #516F7A", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Correo Comercial *
              </label>
              <input
                type="email"
                name="correo_comercial"
                value={formData.correo_comercial}
                onChange={handleChange}
                placeholder="export@winsornewton.com"
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #556F30", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Whitefriars Avenue, London"
                disabled={guardando}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #516F7A", color: "#23361A" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #23361A 0%, #556F30 100%)",
                color: "#EFF4BD",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {guardando ? "Guardando..." : editandoId ? "Actualizar Proveedor" : "Guardar Proveedor"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #362F22",
                  background: "#EFF4BD",
                  color: "#362F22",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "24px",
          border: "1.5px solid #A2B447",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#23361A" }}>
          Directorio de Proveedores ({proveedores.length})
        </h2>
        {cargando ? (
          <p style={{ color: "#516F7A", fontWeight: 600 }}>Cargando proveedores...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#EFF4BD", borderBottom: "2px solid #A2B447", textAlign: "left", color: "#23361A" }}>
                <th style={{ padding: "12px" }}>ID Fiscal</th>
                <th style={{ padding: "12px" }}>Nombre</th>
                <th style={{ padding: "12px" }}>Contacto</th>
                <th style={{ padding: "12px" }}>Correo Comercial</th>
                <th style={{ padding: "12px" }}>Órdenes</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((prov) => (
                <tr key={prov.id_proveedor} style={{ borderBottom: "1px solid rgba(162, 180, 71, 0.35)" }}>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#516F7A" }}>
                    {prov.identificacion_fiscal}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#23361A" }}>{prov.nombre}</td>
                  <td style={{ padding: "12px", color: "#362F22" }}>{prov.contacto} ({prov.telefono})</td>
                  <td style={{ padding: "12px", color: "#516F7A" }}>{prov.correo_comercial}</td>
                  <td style={{ padding: "12px", color: "#556F30", fontWeight: 700 }}>
                    {Array.isArray(prov.ordenes_compra)
                      ? `${prov.ordenes_compra.length} orden(es)`
                      : "0"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => iniciarEdicion(prov)}
                      style={{
                        marginRight: "8px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #556F30",
                        background: "#EFF4BD",
                        color: "#23361A",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(prov)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #362F22",
                        background: "#362F22",
                        color: "#EFF4BD",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {proveedorAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !eliminando && setProveedorAEliminar(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(35, 54, 26, 0.68)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(35, 54, 26, 0.45)",
              border: "2px solid #362F22",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "6px", background: "linear-gradient(90deg, #362F22, #556F30, #516F7A)" }} />
            <div style={{ padding: "26px 24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#EFF4BD",
                    border: "1.5px solid #362F22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#362F22",
                  }}
                >
                  !
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#556F30", textTransform: "uppercase" }}>
                    Confirmación de Seguridad
                  </span>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#23361A" }}>
                    ¿Eliminar este proveedor?
                  </h3>
                </div>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#EFF4BD",
                  border: "1.5px solid #A2B447",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontWeight: 800, color: "#23361A" }}>{proveedorAEliminar.nombre}</div>
                <div style={{ fontSize: "12px", color: "#516F7A", fontWeight: 700 }}>
                  ID Fiscal: {proveedorAEliminar.identificacion_fiscal}
                </div>
              </div>
              <p style={{ margin: "0 0 20px", fontSize: "12.5px", color: "#362F22", fontWeight: 700 }}>
                Esta acción es permanente y no se puede deshacer.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={() => setProveedorAEliminar(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #556F30",
                    background: "#EFF4BD",
                    color: "#23361A",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={confirmarEliminacion}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    border: "1px solid #362F22",
                    background: "#362F22",
                    color: "#EFF4BD",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresPage;

