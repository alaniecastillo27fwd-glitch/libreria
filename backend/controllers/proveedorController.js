const { Op } = require("sequelize");
const { Editorial, Libro } = require("../models");

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const RELACION_LIBROS = [
  {
    model: Libro,
    as: "libros",
    attributes: ["id_libro", "titulo", "numPaginas", "precioLibro", "stock"],
  },
];

const formatearEditorial = (edInstance) => {
  const item = edInstance.toJSON ? edInstance.toJSON() : edInstance;
  const librosArr = Array.isArray(item.libros) ? item.libros : [];
  return {
    id_editorial: item.id_editorial,
    nombre: item.nombre,
    email: item.email,
    telefono: item.telefono,
    pais: item.pais,
    provincia: item.provincia,
    ciudad: item.ciudad,
    libros: librosArr,
    // Propiedades espejo de compatibilidad
    id_proveedor: item.id_editorial,
    identificacion_fiscal: `ED-${String(item.id_editorial).padStart(3, "0")}`,
    contacto: `${item.ciudad}, ${item.pais}`,
    correo_comercial: item.email,
    direccion: `${item.ciudad}, ${item.provincia}, ${item.pais}`,
    ordenes_compra: librosArr,
  };
};

const validarPayloadEditorial = (body) => {
  const errores = [];
  const nombre = (body?.nombre ?? "").toString().trim().slice(0, 50);
  const email = (body?.email ?? body?.correo_comercial ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .slice(0, 50);
  const telefono = (body?.telefono ?? "").toString().trim().slice(0, 20);
  const pais = (body?.pais ?? body?.contacto ?? "Colombia")
    .toString()
    .trim()
    .slice(0, 50);
  const provincia = (body?.provincia ?? "Central").toString().trim().slice(0, 50);
  const ciudad = (body?.ciudad ?? body?.direccion ?? "Capital")
    .toString()
    .trim()
    .slice(0, 50);

  if (!nombre || nombre.length < 2) {
    errores.push("El campo 'nombre' de la editorial es obligatorio (mínimo 2 caracteres).");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errores.push("El campo 'email' es obligatorio y debe tener formato válido.");
  }
  if (!telefono || telefono.length < 5) {
    errores.push("El campo 'telefono' es obligatorio.");
  }
  if (!pais || pais.length < 2) {
    errores.push("El campo 'pais' es obligatorio.");
  }

  return {
    esValido: errores.length === 0,
    errores,
    datosNormalizados: {
      nombre,
      email,
      telefono,
      pais,
      provincia: provincia || "Central",
      ciudad: ciudad || "Capital",
    },
  };
};

// 1. GET /api/editoriales (y /api/proveedores)
exports.obtenerProveedores = async (req, res) => {
  try {
    const editoriales = await Editorial.findAll({
      include: RELACION_LIBROS,
      order: [["id_editorial", "ASC"]],
    });
    return res.status(200).json(editoriales.map(formatearEditorial));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al obtener las editoriales",
      detalle: error.message,
    });
  }
};

// 2. GET /api/editoriales/:id
exports.obtenerProveedorPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    const editorial = await Editorial.findByPk(id, {
      include: RELACION_LIBROS,
    });

    if (!editorial) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    return res.status(200).json(formatearEditorial(editorial));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al consultar la editorial",
      detalle: error.message,
    });
  }
};

// 3. POST /api/editoriales
exports.crearProveedor = async (req, res) => {
  try {
    const { esValido, errores, datosNormalizados } = validarPayloadEditorial(req.body);
    if (!esValido) {
      return res.status(400).json({
        error: "Validación fallida al crear la editorial",
        detalles: errores,
      });
    }

    const duplicada = await Editorial.findOne({
      where: {
        [Op.or]: [
          { nombre: datosNormalizados.nombre },
          { email: datosNormalizados.email },
        ],
      },
    });

    if (duplicada) {
      return res.status(400).json({
        error: "El nombre o correo electrónico ya pertenecen a otra editorial",
      });
    }

    const nuevaEditorial = await Editorial.create(datosNormalizados);
    const conRelaciones = await Editorial.findByPk(nuevaEditorial.id_editorial, {
      include: RELACION_LIBROS,
    });
    return res.status(201).json(formatearEditorial(conRelaciones));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al crear la editorial",
      detalle: error.message,
    });
  }
};

// 4. PUT /api/editoriales/:id
exports.actualizarProveedor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    const editorial = await Editorial.findByPk(id);
    if (!editorial) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    const { esValido, errores, datosNormalizados } = validarPayloadEditorial(req.body);
    if (!esValido) {
      return res.status(400).json({
        error: "Validación fallida al actualizar la editorial",
        detalles: errores,
      });
    }

    const duplicada = await Editorial.findOne({
      where: {
        id_editorial: { [Op.ne]: id },
        [Op.or]: [
          { nombre: datosNormalizados.nombre },
          { email: datosNormalizados.email },
        ],
      },
    });

    if (duplicada) {
      return res.status(400).json({
        error: "El nombre o correo electrónico ya están en uso por otra editorial",
      });
    }

    await editorial.update(datosNormalizados);
    const actualizada = await Editorial.findByPk(id, { include: RELACION_LIBROS });
    return res.status(200).json(formatearEditorial(actualizada));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al actualizar la editorial",
      detalle: error.message,
    });
  }
};

// 5. DELETE /api/editoriales/:id
exports.eliminarProveedor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    const editorial = await Editorial.findByPk(id);
    if (!editorial) {
      return res.status(404).json({ error: "Editorial no encontrada" });
    }

    const librosDependientes = await Libro.count({
      where: { id_editorial: id },
    });

    if (librosDependientes > 0) {
      return res.status(409).json({
        error: `Conflicto de integridad referencial: no se puede eliminar la editorial porque tiene ${librosDependientes} libro(s) asociado(s)`,
        dependencias: { libros: librosDependientes },
      });
    }

    await editorial.destroy();
    return res.status(200).json({
      mensaje: "Editorial eliminada exitosamente",
      id_editorial: id,
      id_proveedor: id,
    });
  } catch (error) {
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        error: "Conflicto de integridad referencial: existen libros asociados a esta editorial",
      });
    }
    return res.status(500).json({
      error: "Error interno al eliminar la editorial",
      detalle: error.message,
    });
  }
};
