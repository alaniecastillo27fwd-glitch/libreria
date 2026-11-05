const { Op } = require("sequelize");
const { Genero, Libro, LibroGenero } = require("../models");

const RELACION_LIBROS = [
  {
    model: Libro,
    as: "libros",
    attributes: ["id_libro", "titulo", "precioLibro", "stock"],
    through: { attributes: [] },
  },
];

const formatearGenero = (gInstance) => {
  const item = gInstance.toJSON ? gInstance.toJSON() : gInstance;
  const librosArr = Array.isArray(item.libros) ? item.libros : [];
  return {
    id_genero: item.id_genero,
    nombreGenero: item.nombreGenero,
    id_posicion: item.id_posicion,
    id_forma_gramatical: item.id_forma_gramatical,
    libros: librosArr,
    // Propiedades espejo de compatibilidad
    id_categoria: item.id_genero,
    nombre: item.nombreGenero,
    descripcion: `Posición #${item.id_posicion} · Forma gramatical #${item.id_forma_gramatical}`,
    productos: librosArr,
  };
};

// 1. GET /api/generos (y /api/categorias)
exports.obtenerCategorias = async (req, res) => {
  try {
    const generos = await Genero.findAll({
      include: RELACION_LIBROS,
      order: [["id_genero", "ASC"]],
    });
    return res.status(200).json(generos.map(formatearGenero));
  } catch (error) {
    return res.status(500).json({
      error: "Error al listar géneros literarios",
      detalle: error.message,
    });
  }
};

// 2. GET /api/generos/:id
exports.obtenerCategoriaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    const genero = await Genero.findByPk(id, {
      include: RELACION_LIBROS,
    });

    if (!genero) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    return res.status(200).json(formatearGenero(genero));
  } catch (error) {
    return res.status(500).json({
      error: "Error al consultar el género literario",
      detalle: error.message,
    });
  }
};

// 3. POST /api/generos
exports.crearCategoria = async (req, res) => {
  try {
    const nombreRaw = req.body?.nombreGenero ?? req.body?.nombre ?? "";
    const id_posicion = Number(req.body?.id_posicion) || 1;
    const id_forma_gramatical = Number(req.body?.id_forma_gramatical) || 1;

    if (!nombreRaw || typeof nombreRaw !== "string" || nombreRaw.trim().length < 2) {
      return res.status(400).json({
        error: "El campo 'nombreGenero' es obligatorio y debe tener al menos 2 caracteres",
      });
    }

    const nombreNormalizado = nombreRaw.trim().slice(0, 50);
    const duplicado = await Genero.findOne({
      where: { nombreGenero: nombreNormalizado },
    });
    if (duplicado) {
      return res.status(400).json({
        error: `El género literario '${nombreNormalizado}' ya existe`,
      });
    }

    const nuevo = await Genero.create({
      nombreGenero: nombreNormalizado,
      id_posicion,
      id_forma_gramatical,
    });

    return res.status(201).json(formatearGenero(nuevo));
  } catch (error) {
    return res.status(500).json({
      error: "Error al crear el género literario",
      detalle: error.message,
    });
  }
};

// 4. PUT /api/generos/:id
exports.actualizarCategoria = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    const genero = await Genero.findByPk(id);
    if (!genero) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    const nombreRaw = req.body?.nombreGenero ?? req.body?.nombre ?? "";
    if (!nombreRaw || typeof nombreRaw !== "string" || nombreRaw.trim().length < 2) {
      return res.status(400).json({
        error: "El campo 'nombreGenero' es obligatorio y debe tener al menos 2 caracteres",
      });
    }

    const nombreNormalizado = nombreRaw.trim().slice(0, 50);
    const duplicado = await Genero.findOne({
      where: {
        nombreGenero: nombreNormalizado,
        id_genero: { [Op.ne]: id },
      },
    });
    if (duplicado) {
      return res.status(400).json({
        error: `El nombre de género '${nombreNormalizado}' ya está en uso`,
      });
    }

    await genero.update({
      nombreGenero: nombreNormalizado,
      id_posicion: Number(req.body?.id_posicion) || genero.id_posicion,
      id_forma_gramatical:
        Number(req.body?.id_forma_gramatical) || genero.id_forma_gramatical,
    });

    const actualizado = await Genero.findByPk(id, { include: RELACION_LIBROS });
    return res.status(200).json(formatearGenero(actualizado));
  } catch (error) {
    return res.status(500).json({
      error: "Error al actualizar el género literario",
      detalle: error.message,
    });
  }
};

// 5. DELETE /api/generos/:id
exports.eliminarCategoria = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    const genero = await Genero.findByPk(id);
    if (!genero) {
      return res.status(404).json({ error: "Género literario no encontrado" });
    }

    const librosDependientes = LibroGenero
      ? await LibroGenero.count({ where: { id_genero: id } })
      : 0;

    if (librosDependientes > 0) {
      return res.status(409).json({
        error: `Conflicto de integridad referencial: no se puede eliminar el género porque tiene ${librosDependientes} libro(s) asociado(s)`,
        dependencias: { libros: librosDependientes },
      });
    }

    await genero.destroy();
    return res.status(200).json({
      mensaje: "Género literario eliminado exitosamente",
      id_genero: id,
      id_categoria: id,
    });
  } catch (error) {
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        error: "Conflicto de integridad referencial: existen libros asociados a este género",
      });
    }
    return res.status(500).json({
      error: "Error al eliminar el género literario",
      detalle: error.message,
    });
  }
};
