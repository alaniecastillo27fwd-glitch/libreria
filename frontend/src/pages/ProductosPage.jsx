import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ESTADO_FORMULARIO_INICIAL = {
  titulo: "",
  id_editorial: "1",
  id_autor: "1",
  id_genero: "1",
  numPaginas: "280",
  precioLibro: "",
  stock: "10",
};

// Paleta Oficial:
// Fresh Grown: #EFF4BD | Azeitona: #A2B447 | Fig Leaf: #556F30
// Moss Green:  #23361A | Wood Bark: #362F22 | Azul Petróleo: #516F7A

const PALETA_OPCIONES = [
  { color: "#556F30", bg: "#EFF4BD", border: "#A2B447" },
  { color: "#516F7A", bg: "rgba(81, 111, 122, 0.16)", border: "#516F7A" },
  { color: "#362F22", bg: "rgba(162, 180, 71, 0.26)", border: "#556F30" },
  { color: "#23361A", bg: "#EFF4BD", border: "#556F30" },
];

const EDITORIALES_RESPALDO = [
  { id_editorial: 1, nombre: "Editorial Macondo", pais: "Colombia" },
  { id_editorial: 2, nombre: "Horizonte Editores", pais: "México" },
  { id_editorial: 3, nombre: "Sueños del Sur", pais: "Argentina" },
  { id_editorial: 4, nombre: "Pluma Fantasma", pais: "Chile" },
  { id_editorial: 5, nombre: "Misterio Andino", pais: "Perú" },
  { id_editorial: 6, nombre: "Fuego Editorial", pais: "Ecuador" },
  { id_editorial: 7, nombre: "Fragmenta Press", pais: "Uruguay" },
];

const AUTORES_RESPALDO = [
  { id_autor: 1, nombre: "Gabriel Márquez", nacionalidad_nombre: "Colombiana" },
  { id_autor: 2, nombre: "Elena Rodríguez", nacionalidad_nombre: "Mexicana" },
  { id_autor: 3, nombre: "Carlos Méndez", nacionalidad_nombre: "Argentina" },
  { id_autor: 4, nombre: "Lucía Herrera", nacionalidad_nombre: "Chilena" },
  { id_autor: 5, nombre: "Tomás Vargas", nacionalidad_nombre: "Peruana" },
  { id_autor: 6, nombre: "Isabel Soto", nacionalidad_nombre: "Ecuatoriana" },
  { id_autor: 7, nombre: "Raúl Jiménez", nacionalidad_nombre: "Uruguaya" },
];

const GENEROS_RESPALDO = [
  { id_genero: 1, nombreGenero: "Novela Histórica y Romance" },
  { id_genero: 2, nombreGenero: "Ciencia Ficción Cuántica" },
  { id_genero: 3, nombreGenero: "Fantasía Épica y Sueños" },
  { id_genero: 4, nombreGenero: "Terror Gótico y Suspenso" },
  { id_genero: 5, nombreGenero: "Misterio y Policial" },
  { id_genero: 6, nombreGenero: "Aventura y Acción" },
  { id_genero: 7, nombreGenero: "Ensayo y Ficción Social" },
];

const obtenerIniciales = (texto, fallback = "ID") => {
  if (!texto || typeof texto !== "string") return fallback;
  const palabras = texto.trim().split(/\s+/);
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
  }
  return texto.slice(0, 2).toUpperCase();
};

/**
 * Selector desplegable personalizado con la paleta oficial (#EFF4BD, #A2B447, #556F30, #23361A, #362F22, #516F7A).
 */
const SelectColorido = ({
  id,
  name,
  value,
  onChange,
  disabled,
  required,
  placeholder,
  options,
  accentColor = "#556F30",
  accentBg = "#EFF4BD",
  accentBorder = "#A2B447",
}) => {
  const [abierto, setAbierto] = useState(false);
  const [opcionHover, setOpcionHover] = useState(null);
  const contenedorRef = useRef(null);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const opcionSeleccionada = options.find(
    (opt) => String(opt.value) === String(value)
  );

  const seleccionarOpcion = (nuevoValor) => {
    if (disabled) return;
    onChange({
      target: {
        name,
        value: String(nuevoValor),
      },
    });
    setAbierto(false);
  };

  return (
    <div ref={contenedorRef} style={{ position: "relative", width: "100%" }}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: "1px",
          height: "1px",
          bottom: 0,
          left: 0,
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.badge ? `${opt.label} (${opt.badge})` : opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="select-colorido-trigger"
        disabled={disabled}
        onClick={() => !disabled && setAbierto((prev) => !prev)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 12px",
          borderRadius: "12px",
          border: abierto
            ? `2px solid ${accentColor}`
            : `1.5px solid ${accentBorder}`,
          background: abierto
            ? `linear-gradient(135deg, #FFFFFF 0%, ${accentBg} 100%)`
            : "#FFFFFF",
          boxShadow: abierto
            ? "0 0 0 3px rgba(162, 180, 71, 0.28), 0 8px 20px -6px rgba(35, 54, 26, 0.22)"
            : "0 2px 6px rgba(35, 54, 26, 0.06)",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "all 0.18s ease",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            minWidth: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: opcionSeleccionada?.bg || accentBg,
              color: opcionSeleccionada?.color || accentColor,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 800,
              flexShrink: 0,
              border: `1px solid ${accentBorder}`,
            }}
          >
            {opcionSeleccionada?.icono || "ID"}
          </span>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              className="select-colorido-label"
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: opcionSeleccionada ? "#23361A" : "#516F7A",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {opcionSeleccionada ? opcionSeleccionada.label : placeholder}
            </div>
          </div>

          {opcionSeleccionada?.badge && (
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 800,
                background: opcionSeleccionada.bg || accentBg,
                color: opcionSeleccionada.color || accentColor,
                border: `1px solid ${accentBorder}`,
                flexShrink: 0,
                letterSpacing: "0.02em",
              }}
            >
              {opcionSeleccionada.badge}
            </span>
          )}
        </div>

        <span
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "7px",
            background: accentBg,
            color: accentColor,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 900,
            flexShrink: 0,
            transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>

      {abierto && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            minWidth: "250px",
            background: "#FFFFFF",
            borderRadius: "14px",
            padding: "8px",
            border: `1.5px solid ${accentBorder}`,
            boxShadow:
              "0 20px 38px -8px rgba(35, 54, 26, 0.28), 0 0 0 1px rgba(54, 47, 34, 0.08)",
            zIndex: 100,
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "5px 10px 7px",
              fontSize: "10.5px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#23361A",
              borderBottom: "1px solid #EFF4BD",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Selecciona una opción</span>
            <span
              style={{
                background: "#EFF4BD",
                color: "#23361A",
                padding: "2px 7px",
                borderRadius: "999px",
                fontSize: "10px",
                border: "1px solid #A2B447",
              }}
            >
              {options.length} disponibles
            </span>
          </div>

          {options.map((opt) => {
            const activo = String(opt.value) === String(value);
            const enHover = opcionHover === opt.value;
            const colorItem = opt.color || accentColor;
            const bgItem = opt.bg || accentBg;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={activo}
                onMouseEnter={() => setOpcionHover(opt.value)}
                onMouseLeave={() => setOpcionHover(null)}
                onClick={() => seleccionarOpcion(opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "9px 11px",
                  marginBottom: "4px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: activo
                    ? `linear-gradient(135deg, ${colorItem} 0%, #23361A 100%)`
                    : enHover
                    ? "#EFF4BD"
                    : "transparent",
                  color: activo ? "#EFF4BD" : "#23361A",
                  border: activo
                    ? `1px solid ${colorItem}`
                    : enHover
                    ? "1px solid #A2B447"
                    : "1px solid transparent",
                  boxShadow: activo
                    ? "0 6px 14px -3px rgba(35, 54, 26, 0.35)"
                    : "none",
                  transition: "all 0.14s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "8px",
                      background: activo ? "rgba(239, 244, 189, 0.22)" : bgItem,
                      color: activo ? "#EFF4BD" : colorItem,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {opt.icono || "ID"}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: activo ? 800 : 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {opt.label}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  {opt.badge && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: activo ? "#A2B447" : bgItem,
                        color: activo ? "#23361A" : colorItem,
                        border: "1px solid #A2B447",
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}

                  {activo && (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 900,
                        color: "#EFF4BD",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProductosPage = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [libros, setLibros] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [autores, setAutores] = useState([]);
  const [generos, setGeneros] = useState([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [cargandoRelaciones, setCargandoRelaciones] = useState(true);

  const [formData, setFormData] = useState(ESTADO_FORMULARIO_INICIAL);
  const [libroEditandoId, setLibroEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [errorBanner, setErrorBanner] = useState("");
  const [exitoBanner, setExitoBanner] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // 1. Carga paralela de libros, editoriales, autores y géneros desde MySQL (`libreria`)
  const cargarCatalogos = useCallback(async () => {
    setCargandoDatos(true);
    setCargandoRelaciones(true);
    setErrorBanner("");

    const [resLibros, resEditoriales, resAutores, resGeneros] =
      await Promise.allSettled([
        api.get("/libros"),
        api.get("/editoriales"),
        api.get("/autores"),
        api.get("/generos"),
      ]);

    if (resLibros.status === "fulfilled") {
      setLibros(Array.isArray(resLibros.value) ? resLibros.value : []);
    } else if (resLibros.reason?.status !== 401) {
      setErrorBanner(
        resLibros.reason?.message ||
          "Error al sincronizar el catálogo de libros desde MySQL."
      );
    }

    if (
      resEditoriales.status === "fulfilled" &&
      Array.isArray(resEditoriales.value) &&
      resEditoriales.value.length > 0
    ) {
      setEditoriales(resEditoriales.value);
    } else {
      setEditoriales(EDITORIALES_RESPALDO);
    }

    if (
      resAutores.status === "fulfilled" &&
      Array.isArray(resAutores.value) &&
      resAutores.value.length > 0
    ) {
      setAutores(resAutores.value);
    } else {
      setAutores(AUTORES_RESPALDO);
    }

    if (
      resGeneros.status === "fulfilled" &&
      Array.isArray(resGeneros.value) &&
      resGeneros.value.length > 0
    ) {
      setGeneros(resGeneros.value);
    } else {
      setGeneros(GENEROS_RESPALDO);
    }

    setCargandoDatos(false);
    setCargandoRelaciones(false);
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const handleCerrarSesion = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorBanner) setErrorBanner("");
    if (exitoBanner) setExitoBanner("");
  };

  const iniciarEdicion = (libro) => {
    const idReal = libro.id_libro ?? libro.id_producto;
    setLibroEditandoId(idReal);
    setFormData({
      titulo: libro.titulo || libro.nombre || "",
      id_editorial: String(
        libro.id_editorial ?? libro.editorial?.id_editorial ?? "1"
      ),
      id_autor: String(
        libro.id_autor ??
          libro.autores?.[0]?.id_autor ??
          ((Number(libro.id_editorial || 1) - 1) % 7) + 1
      ),
      id_genero: String(
        libro.id_genero ??
          libro.generos?.[0]?.id_genero ??
          ((Number(libro.id_editorial || 1) - 1) % 7) + 1
      ),
      numPaginas: String(libro.numPaginas ?? "280"),
      precioLibro: String(libro.precioLibro ?? libro.precio_venta ?? ""),
      stock: String(libro.stock ?? libro.stock_minimo ?? "0"),
    });
    setErrorBanner("");
    setExitoBanner("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setLibroEditandoId(null);
    setFormData(ESTADO_FORMULARIO_INICIAL);
    setErrorBanner("");
  };

  const validarFormulario = () => {
    if (!formData.titulo.trim() || formData.titulo.trim().length < 2) {
      setErrorBanner("El título del libro es obligatorio (mínimo 2 caracteres).");
      return false;
    }
    if (!formData.id_editorial) {
      setErrorBanner("Debes seleccionar una editorial válida.");
      return false;
    }
    if (Number(formData.numPaginas) <= 0) {
      setErrorBanner("El número de páginas debe ser mayor a 0.");
      return false;
    }
    if (Number(formData.precioLibro) <= 0) {
      setErrorBanner("El precio del libro debe ser mayor a 0.");
      return false;
    }
    if (Number(formData.stock) < 0) {
      setErrorBanner("El stock disponible no puede ser negativo.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardando) return;
    if (!validarFormulario()) return;

    setGuardando(true);
    setErrorBanner("");
    setExitoBanner("");

    const payload = {
      titulo: formData.titulo.trim(),
      id_editorial: Number(formData.id_editorial),
      id_autor: Number(formData.id_autor),
      id_genero: Number(formData.id_genero),
      numPaginas: Number(formData.numPaginas),
      precioLibro: Number(formData.precioLibro),
      stock: Number(formData.stock),
    };

    try {
      if (libroEditandoId) {
        const actualizado = await api.put(`/libros/${libroEditandoId}`, payload);
        setLibros((prev) =>
          prev.map((item) =>
            Number(item.id_libro) === Number(libroEditandoId) ? actualizado : item
          )
        );
        setExitoBanner(`Libro "${actualizado.titulo}" actualizado correctamente.`);
      } else {
        const creado = await api.post("/libros", payload);
        setLibros((prev) => [creado, ...prev]);
        setExitoBanner(`Libro "${creado.titulo}" registrado exitosamente.`);
      }

      setLibroEditandoId(null);
      setFormData(ESTADO_FORMULARIO_INICIAL);
    } catch (error) {
      if (error.status !== 401) {
        setErrorBanner(error.message || "Error al guardar el libro.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (libro) => {
    setErrorBanner("");
    setExitoBanner("");
    setLibroAEliminar(libro);
  };

  const confirmarEliminacion = async () => {
    if (!libroAEliminar || eliminando) return;

    const libro = libroAEliminar;
    const idReal = libro.id_libro ?? libro.id_producto;
    setEliminando(true);
    setErrorBanner("");
    setExitoBanner("");

    try {
      await api.delete(`/libros/${idReal}`);

      setLibros((prev) =>
        prev.filter((item) => Number(item.id_libro) !== Number(idReal))
      );

      if (Number(libroEditandoId) === Number(idReal)) {
        cancelarEdicion();
      }

      setExitoBanner(`El libro "${libro.titulo}" fue eliminado del catálogo.`);
      setLibroAEliminar(null);
    } catch (error) {
      if (error.status === 409) {
        setErrorBanner(
          error.message ||
            "Conflicto (409): No se puede eliminar este libro porque tiene ventas o reseñas asociadas."
        );
      } else if (error.status !== 401) {
        setErrorBanner(error.message || "No fue posible eliminar el libro.");
      }
      setLibroAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const obtenerNombreEditorial = (libro) => {
    if (libro.editorial?.nombre) return libro.editorial.nombre;
    if (libro.editorial_nombre) return libro.editorial_nombre;
    const encontrada = editoriales.find(
      (ed) => Number(ed.id_editorial) === Number(libro.id_editorial)
    );
    return encontrada ? encontrada.nombre : `Editorial #${libro.id_editorial}`;
  };

  const obtenerNombreAutor = (libro) => {
    if (libro.autores_lista && libro.autores_lista !== "Sin autor asignado") {
      return libro.autores_lista;
    }
    if (libro.autor_nombre) return libro.autor_nombre;
    const encontrado = autores.find(
      (a) => Number(a.id_autor) === Number(libro.id_autor)
    );
    return encontrado ? encontrado.nombre : "Autor Editorial";
  };

  const obtenerNombreGenero = (libro) => {
    if (libro.generos_lista && libro.generos_lista !== "General") {
      return libro.generos_lista;
    }
    if (libro.genero_nombre) return libro.genero_nombre;
    const encontrado = generos.find(
      (g) => Number(g.id_genero) === Number(libro.id_genero)
    );
    return encontrado ? encontrado.nombreGenero || encontrado.nombre : "Literatura General";
  };

  const librosFiltrados = libros.filter((l) => {
    if (!busqueda.trim()) return true;
    const termino = busqueda.toLowerCase();
    const codigo = (l.codigo_isbn || `LIB-${String(l.id_libro).padStart(4, "0")}`).toLowerCase();
    return (
      l.titulo?.toLowerCase().includes(termino) ||
      codigo.includes(termino) ||
      obtenerNombreEditorial(l).toLowerCase().includes(termino) ||
      obtenerNombreAutor(l).toLowerCase().includes(termino) ||
      obtenerNombreGenero(l).toLowerCase().includes(termino)
    );
  });

  return (
    <div
      style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "24px 20px 48px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Barra superior de sesión activa + navegación del dominio Librería */}
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
          boxShadow: "0 8px 24px rgba(35, 54, 26, 0.22)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#EFF4BD" }}>
            Gestión de Libros · Base de Datos Librería
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#EFF4BD", opacity: 0.9 }}>
            Operador autenticado:{" "}
            <strong>{usuario?.nombre || "Usuario Activo"}</strong> (
            {usuario?.correo || "Sesión JWT"})
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <Link
            to="/generos"
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
            Géneros Literarios
          </Link>
          <Link
            to="/editoriales"
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
            Editoriales
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

      {/* Alertas de Error y Éxito */}
      {errorBanner && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#362F22",
            border: "1.5px solid #A2B447",
            color: "#EFF4BD",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {errorBanner}
        </div>
      )}

      {exitoBanner && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#EFF4BD",
            border: "1.5px solid #556F30",
            color: "#23361A",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {exitoBanner}
        </div>
      )}

      {/* Panel de Creación y Edición de Libros con la Paleta Oficial */}
      <section
        style={{
          background: libroEditandoId
            ? "linear-gradient(145deg, #FFFFFF 0%, #EFF4BD 55%, rgba(81, 111, 122, 0.16) 100%)"
            : "linear-gradient(145deg, #FFFFFF 0%, rgba(239, 244, 189, 0.45) 70%, rgba(162, 180, 71, 0.15) 100%)",
          borderRadius: "20px",
          padding: "0",
          marginBottom: "30px",
          border: libroEditandoId
            ? "2px solid #516F7A"
            : "1.5px solid #A2B447",
          boxShadow: libroEditandoId
            ? "0 18px 42px -10px rgba(35, 54, 26, 0.25), 0 0 0 4px rgba(81, 111, 122, 0.15)"
            : "0 12px 30px -8px rgba(35, 54, 26, 0.14)",
          transition: "all 0.25s ease",
        }}
      >
        <div
          style={{
            background: libroEditandoId
              ? "linear-gradient(135deg, #362F22 0%, #23361A 48%, #516F7A 100%)"
              : "linear-gradient(135deg, #23361A 0%, #556F30 52%, #A2B447 100%)",
            padding: "18px 24px",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            color: "#EFF4BD",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(239, 244, 189, 0.18)",
                border: "1px solid #EFF4BD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                boxShadow: "0 6px 16px rgba(35, 54, 26, 0.25)",
              }}
            >
              {libroEditandoId ? "ED" : "LB"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    fontWeight: 800,
                    color: "#EFF4BD",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {libroEditandoId
                    ? `Editar Libro #${libroEditandoId}`
                    : "Registrar Nuevo Libro"}
                </h2>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    background: "#A2B447",
                    color: "#23361A",
                    border: "1px solid #EFF4BD",
                  }}
                >
                  {libroEditandoId ? "Modo Edición Activo" : "Tabla MySQL · libros"}
                </span>
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12.5px",
                  color: "#EFF4BD",
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                {libroEditandoId
                  ? `Modificando "${formData.titulo || "Libro"}" · ID #${libroEditandoId}`
                  : "Registra el título, editorial, autor, género literario, número de páginas, precio y stock."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {Number(formData.precioLibro) > 0 && Number(formData.stock) >= 0 && (
              <div
                style={{
                  padding: "7px 13px",
                  borderRadius: "10px",
                  background: "rgba(35, 54, 26, 0.55)",
                  border: "1px solid #A2B447",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#EFF4BD",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Valor Inventario:</span>
                <span style={{ color: "#EFF4BD", fontWeight: 800 }}>
                  ₡
                  {(
                    Number(formData.precioLibro) * Number(formData.stock)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            {libroEditandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{
                  padding: "7px 13px",
                  borderRadius: "10px",
                  border: "1px solid #EFF4BD",
                  background: "#362F22",
                  color: "#EFF4BD",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Salir de edición
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            {/* 1. Título del Libro (`libros.titulo`) */}
            <div
              style={{
                background: "rgba(239, 244, 189, 0.65)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #A2B447",
                gridColumn: "span 2",
              }}
            >
              <label
                htmlFor="libro-titulo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#556F30",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  OBRA
                </span>
                <span>Título del Libro *</span>
              </label>
              <input
                id="libro-titulo"
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ej. Amor en tiempos de guerra"
                disabled={guardando}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #556F30",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#23361A",
                  outline: "none",
                }}
              />
            </div>

            {/* 2. Editorial (`libros.id_editorial` -> `editoriales`) */}
            <div
              style={{
                background: "rgba(162, 180, 71, 0.18)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #556F30",
              }}
            >
              <label
                htmlFor="libro-editorial"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#23361A",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  EDITORIAL
                </span>
                <span>Editorial (FK MySQL) *</span>
              </label>

              <SelectColorido
                id="libro-editorial"
                name="id_editorial"
                value={formData.id_editorial}
                onChange={handleInputChange}
                disabled={cargandoRelaciones || guardando}
                required
                placeholder="Seleccione una editorial..."
                accentColor="#556F30"
                accentBg="#EFF4BD"
                accentBorder="#556F30"
                options={editoriales.map((ed, idx) => {
                  const tema = PALETA_OPCIONES[idx % PALETA_OPCIONES.length];
                  return {
                    value: ed.id_editorial,
                    label: ed.nombre,
                    badge: ed.pais || `ID #${ed.id_editorial}`,
                    icono: obtenerIniciales(ed.nombre, "ED"),
                    color: tema.color,
                    bg: tema.bg,
                  };
                })}
              />
            </div>

            {/* 3. Autor (`libros_autores` -> `autores`) */}
            <div
              style={{
                background: "rgba(54, 47, 34, 0.08)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #362F22",
              }}
            >
              <label
                htmlFor="libro-autor"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#362F22",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#362F22",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  AUTOR
                </span>
                <span>Autor Principal *</span>
              </label>

              <SelectColorido
                id="libro-autor"
                name="id_autor"
                value={formData.id_autor}
                onChange={handleInputChange}
                disabled={cargandoRelaciones || guardando}
                accentColor="#362F22"
                accentBg="#EFF4BD"
                accentBorder="#362F22"
                options={autores.map((autor, idx) => {
                  const tema = PALETA_OPCIONES[idx % PALETA_OPCIONES.length];
                  return {
                    value: autor.id_autor,
                    label: autor.nombre,
                    badge:
                      autor.nacionalidad_nombre ||
                      autor.nacionalidad?.nombre_nacionalidad ||
                      `Autor #${autor.id_autor}`,
                    icono: obtenerIniciales(autor.nombre, "AU"),
                    color: tema.color,
                    bg: tema.bg,
                  };
                })}
              />
            </div>

            {/* 4. Género Literario (`libro_genero` -> `generos`) */}
            <div
              style={{
                background: "rgba(81, 111, 122, 0.14)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #516F7A",
              }}
            >
              <label
                htmlFor="libro-genero"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#516F7A",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  GÉNERO
                </span>
                <span>Género Literario *</span>
              </label>

              <SelectColorido
                id="libro-genero"
                name="id_genero"
                value={formData.id_genero}
                onChange={handleInputChange}
                disabled={cargandoRelaciones || guardando}
                accentColor="#516F7A"
                accentBg="#EFF4BD"
                accentBorder="#516F7A"
                options={generos.map((g, idx) => {
                  const tema = PALETA_OPCIONES[idx % PALETA_OPCIONES.length];
                  const nombreGen = g.nombreGenero || g.nombre;
                  return {
                    value: g.id_genero ?? g.id_categoria,
                    label: nombreGen,
                    badge: `ID #${g.id_genero ?? g.id_categoria}`,
                    icono: obtenerIniciales(nombreGen, "GN"),
                    color: tema.color,
                    bg: tema.bg,
                  };
                })}
              />
            </div>

            {/* 5. Número de Páginas (`libros.numPaginas`) */}
            <div
              style={{
                background: "rgba(81, 111, 122, 0.12)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #516F7A",
              }}
            >
              <label
                htmlFor="libro-paginas"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#516F7A",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  PÁGS
                </span>
                <span>Número de Páginas *</span>
              </label>
              <input
                id="libro-paginas"
                type="number"
                min="1"
                step="1"
                name="numPaginas"
                value={formData.numPaginas}
                onChange={handleInputChange}
                placeholder="320"
                disabled={guardando}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #516F7A",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#23361A",
                  outline: "none",
                }}
              />
            </div>

            {/* 6. Precio del Libro (`libros.precioLibro`) */}
            <div
              style={{
                background: "rgba(162, 180, 71, 0.22)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #556F30",
              }}
            >
              <label
                htmlFor="libro-precio"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#556F30",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  PRECIO
                </span>
                <span>Precio del Libro (₡) *</span>
              </label>
              <input
                id="libro-precio"
                type="number"
                min="1"
                step="1"
                name="precioLibro"
                value={formData.precioLibro}
                onChange={handleInputChange}
                placeholder="8500"
                disabled={guardando}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #556F30",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#23361A",
                  outline: "none",
                }}
              />
            </div>

            {/* 7. Stock Disponible (`libros.stock`) */}
            <div
              style={{
                background: "rgba(239, 244, 189, 0.65)",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "1.5px solid #A2B447",
              }}
            >
              <label
                htmlFor="libro-stock"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#23361A",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    background: "#23361A",
                    color: "#EFF4BD",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  STOCK
                </span>
                <span>Stock en Librería *</span>
              </label>
              <input
                id="libro-stock"
                type="number"
                min="0"
                step="1"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                disabled={guardando}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #556F30",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#23361A",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: "12px 26px",
                borderRadius: "12px",
                border: "1px solid #EFF4BD",
                background: libroEditandoId
                  ? "linear-gradient(135deg, #23361A 0%, #556F30 55%, #516F7A 100%)"
                  : "linear-gradient(135deg, #23361A 0%, #556F30 100%)",
                color: "#EFF4BD",
                fontSize: "14px",
                fontWeight: 800,
                cursor: guardando ? "not-allowed" : "pointer",
                boxShadow: "0 10px 22px -6px rgba(35, 54, 26, 0.38)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>
                {guardando
                  ? "Guardando..."
                  : libroEditandoId
                  ? "Actualizar Libro"
                  : "Guardar Libro"}
              </span>
            </button>

            {libroEditandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1.5px solid #362F22",
                  background: "#EFF4BD",
                  color: "#362F22",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Cancelar Edición</span>
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Tabla de Libros sincronizada con `libreria.libros` */}
      <section
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "24px",
          border: "1.5px solid #A2B447",
          boxShadow: "0 6px 20px rgba(35, 54, 26, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#23361A" }}>
            Catálogo de Libros ({librosFiltrados.length})
          </h2>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, autor, editorial o género..."
            style={{
              minWidth: "280px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1.5px solid #556F30",
              fontSize: "13.5px",
              color: "#23361A",
              backgroundColor: "rgba(239, 244, 189, 0.3)",
            }}
          />
        </div>

        {cargandoDatos ? (
          <p style={{ padding: "24px", textAlign: "center", color: "#516F7A", fontWeight: 600 }}>
            Cargando catálogo de libros desde MySQL...
          </p>
        ) : librosFiltrados.length === 0 ? (
          <p style={{ padding: "24px", textAlign: "center", color: "#516F7A", fontWeight: 600 }}>
            No hay libros que coincidan con la búsqueda.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13.5px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#EFF4BD",
                    borderBottom: "2px solid #A2B447",
                    textAlign: "left",
                    color: "#23361A",
                  }}
                >
                  <th style={{ padding: "12px" }}>Código / ID</th>
                  <th style={{ padding: "12px" }}>Título y Autor</th>
                  <th style={{ padding: "12px" }}>Editorial</th>
                  <th style={{ padding: "12px" }}>Género Literario</th>
                  <th style={{ padding: "12px" }}>Páginas</th>
                  <th style={{ padding: "12px" }}>Precio</th>
                  <th style={{ padding: "12px" }}>Stock</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {librosFiltrados.map((libro) => {
                  const idReal = libro.id_libro ?? libro.id_producto;
                  const estaEditando = Number(libroEditandoId) === Number(idReal);
                  const codigoIsbn =
                    libro.codigo_isbn || `LIB-${String(idReal).padStart(4, "0")}`;

                  return (
                    <tr
                      key={idReal}
                      style={{
                        borderBottom: "1px solid rgba(162, 180, 71, 0.35)",
                        background: estaEditando
                          ? "linear-gradient(90deg, #EFF4BD 0%, rgba(162, 180, 71, 0.25) 100%)"
                          : "transparent",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: 800, color: "#23361A" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 9px",
                            borderRadius: "8px",
                            background: estaEditando ? "#23361A" : "#EFF4BD",
                            color: estaEditando ? "#EFF4BD" : "#23361A",
                            border: "1px solid #A2B447",
                            fontSize: "12px",
                          }}
                        >
                          {codigoIsbn}
                        </span>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#23361A",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>{libro.titulo || libro.nombre}</span>
                          {estaEditando && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "10.5px",
                                fontWeight: 800,
                                background: "#516F7A",
                                color: "#EFF4BD",
                              }}
                            >
                              Editando ahora
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#516F7A", marginTop: "3px", fontWeight: 600 }}>
                          Autor: {obtenerNombreAutor(libro)}
                          {libro.autor_nacionalidad ? ` (${libro.autor_nacionalidad})` : ""}
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            backgroundColor: "#EFF4BD",
                            border: "1px solid #556F30",
                            color: "#23361A",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {obtenerNombreEditorial(libro)}
                        </span>
                        {libro.editorial_pais && (
                          <div style={{ fontSize: "11px", color: "#516F7A", marginTop: "3px", fontWeight: 600 }}>
                            {libro.editorial_ciudad
                              ? `${libro.editorial_ciudad}, ${libro.editorial_pais}`
                              : libro.editorial_pais}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            backgroundColor: "rgba(81, 111, 122, 0.14)",
                            border: "1px solid #516F7A",
                            color: "#23361A",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {obtenerNombreGenero(libro)}
                        </span>
                      </td>

                      <td style={{ padding: "12px", fontWeight: 700, color: "#362F22" }}>
                        {Number(libro.numPaginas || 0)} págs.
                      </td>

                      <td style={{ padding: "12px", fontWeight: 800, color: "#556F30" }}>
                        ₡{Number(libro.precioLibro ?? libro.precio_venta ?? 0).toLocaleString()}
                      </td>

                      <td style={{ padding: "12px", fontWeight: 700, color: "#516F7A" }}>
                        {Number(libro.stock ?? libro.stock_minimo ?? 0)} uds.
                      </td>

                      <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(libro)}
                          style={{
                            marginRight: "8px",
                            padding: "7px 13px",
                            borderRadius: "9px",
                            border: "1px solid #556F30",
                            background: estaEditando ? "#23361A" : "#EFF4BD",
                            color: estaEditando ? "#EFF4BD" : "#23361A",
                            fontWeight: 700,
                            fontSize: "12.5px",
                            cursor: "pointer",
                          }}
                        >
                          {estaEditando ? "Editando" : "Editar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(libro)}
                          style={{
                            padding: "7px 13px",
                            borderRadius: "9px",
                            border: "1px solid #362F22",
                            background: "#362F22",
                            color: "#EFF4BD",
                            fontWeight: 700,
                            fontSize: "12.5px",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de confirmación de eliminación con la paleta oficial */}
      {libroAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-eliminar-titulo"
          onClick={() => !eliminando && setLibroAEliminar(null)}
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
              maxWidth: "460px",
              background: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(35, 54, 26, 0.45)",
              border: "2px solid #362F22",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "6px",
                background: "linear-gradient(90deg, #362F22 0%, #556F30 50%, #516F7A 100%)",
              }}
            />
            <div style={{ padding: "28px 26px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "#EFF4BD",
                    border: "1.5px solid #362F22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#362F22",
                    flexShrink: 0,
                  }}
                >
                  !
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      color: "#556F30",
                      marginBottom: "2px",
                    }}
                  >
                    Confirmación de Seguridad
                  </span>
                  <h3
                    id="modal-eliminar-titulo"
                    style={{
                      margin: 0,
                      fontSize: "19px",
                      fontWeight: 800,
                      color: "#23361A",
                    }}
                  >
                    ¿Eliminar este libro?
                  </h3>
                </div>
              </div>

              <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#362F22", lineHeight: 1.55 }}>
                Estás a punto de eliminar de la base de datos el siguiente libro:
              </p>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#EFF4BD",
                  border: "1.5px solid #A2B447",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#23361A", marginBottom: "4px" }}>
                  {libroAEliminar.titulo || libroAEliminar.nombre}
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "12.5px", color: "#362F22", fontWeight: 600, flexWrap: "wrap" }}>
                  <span>
                    Código:{" "}
                    <strong style={{ color: "#516F7A" }}>
                      {libroAEliminar.codigo_isbn || `LIB-${String(libroAEliminar.id_libro).padStart(4, "0")}`}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>{obtenerNombreEditorial(libroAEliminar)}</span>
                  <span>•</span>
                  <span>{obtenerNombreAutor(libroAEliminar)}</span>
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(54, 47, 34, 0.1)",
                  border: "1px solid #362F22",
                  color: "#362F22",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  marginBottom: "22px",
                }}
              >
                Esta acción es permanente y no se puede deshacer.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={() => setLibroAEliminar(null)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "1.5px solid #556F30",
                    background: "#EFF4BD",
                    color: "#23361A",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: eliminando ? "not-allowed" : "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={confirmarEliminacion}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "1px solid #362F22",
                    background: "#362F22",
                    color: "#EFF4BD",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: eliminando ? "not-allowed" : "pointer",
                  }}
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar libro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
