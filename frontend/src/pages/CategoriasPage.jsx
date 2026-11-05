import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ESTADO_INICIAL = {
  nombre: "",
  descripcion: "",
};

const CategoriasPage = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [exitoBanner, setExitoBanner] = useState("");

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    setErrorBanner("");
    try {
      const data = await api.get("/categorias");
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.status !== 401) {
        setErrorBanner(error.message || "Error al cargar las categorías.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

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

  const iniciarEdicion = (cat) => {
    setEditandoId(cat.id_categoria);
    setFormData({
      nombre: cat.nombre || "",
      descripcion: cat.descripcion || "",
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

    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      setErrorBanner("El nombre de la categoría es obligatorio (mínimo 2 caracteres).");
      return;
    }

    setGuardando(true);
    setErrorBanner("");
    setExitoBanner("");

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
    };

    try {
      if (editandoId) {
        const actualizada = await api.put(`/categorias/${editandoId}`, payload);
        setCategorias((prev) =>
          prev.map((c) => (c.id_categoria === editandoId ? { ...c, ...actualizada } : c))
        );
        setExitoBanner(`Categoría "${actualizada.nombre}" actualizada correctamente.`);
      } else {
        const creada = await api.post("/categorias", payload);
        setCategorias((prev) => [...prev, creada]);
        setExitoBanner(`Categoría "${creada.nombre}" creada exitosamente.`);
      }
      setEditandoId(null);
      setFormData(ESTADO_INICIAL);
    } catch (error) {
      if (error.status !== 401) {
        setErrorBanner(error.message || "Error al guardar la categoría.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (cat) => {
    setErrorBanner("");
    setExitoBanner("");
    setCategoriaAEliminar(cat);
  };

  const confirmarEliminacion = async () => {
    if (!categoriaAEliminar || eliminando) return;
    const cat = categoriaAEliminar;
    setEliminando(true);
    setErrorBanner("");
    setExitoBanner("");

    try {
      await api.delete(`/categorias/${cat.id_categoria}`);
      setCategorias((prev) => prev.filter((c) => c.id_categoria !== cat.id_categoria));
      if (editandoId === cat.id_categoria) {
        cancelarEdicion();
      }
      setExitoBanner(`Categoría "${cat.nombre}" eliminada exitosamente.`);
      setCategoriaAEliminar(null);
    } catch (error) {
      if (error.status === 409) {
        setErrorBanner(
          error.message ||
            "Conflicto (409): No se puede eliminar la categoría porque tiene productos asociados."
        );
      } else if (error.status !== 401) {
        setErrorBanner(error.message || "Error al eliminar la categoría.");
      }
      setCategoriaAEliminar(null);
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
            Gestión de Categorías · ArtSupply Pro
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
            to="/proveedores"
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
            Proveedores
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
          {editandoId ? `Editar Categoría #${editandoId}` : "Registrar Nueva Categoría"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Acuarelas Profesionales"
                disabled={guardando}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #556F30", color: "#23361A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700, color: "#23361A" }}>
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción técnica de la línea de insumos..."
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
              {guardando ? "Guardando..." : editandoId ? "Actualizar Categoría" : "Guardar Categoría"}
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
          Listado de Categorías ({categorias.length})
        </h2>
        {cargando ? (
          <p style={{ color: "#516F7A", fontWeight: 600 }}>Cargando categorías...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#EFF4BD", borderBottom: "2px solid #A2B447", textAlign: "left", color: "#23361A" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Nombre</th>
                <th style={{ padding: "12px" }}>Descripción</th>
                <th style={{ padding: "12px" }}>Productos Vinculados</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id_categoria} style={{ borderBottom: "1px solid rgba(162, 180, 71, 0.35)" }}>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#516F7A" }}>#{cat.id_categoria}</td>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#23361A" }}>{cat.nombre}</td>
                  <td style={{ padding: "12px", color: "#516F7A" }}>{cat.descripcion || "—"}</td>
                  <td style={{ padding: "12px", color: "#556F30", fontWeight: 700 }}>
                    {Array.isArray(cat.productos) ? `${cat.productos.length} producto(s)` : "0"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => iniciarEdicion(cat)}
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
                      onClick={() => handleEliminar(cat)}
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

      {categoriaAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !eliminando && setCategoriaAEliminar(null)}
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
                    ¿Eliminar esta categoría?
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
                  fontWeight: 700,
                  color: "#23361A",
                }}
              >
                {categoriaAEliminar.nombre} (#{categoriaAEliminar.id_categoria})
              </div>
              <p style={{ margin: "0 0 20px", fontSize: "12.5px", color: "#362F22", fontWeight: 700 }}>
                Esta acción es permanente y no se puede deshacer.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={() => setCategoriaAEliminar(null)}
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

export default CategoriasPage;

