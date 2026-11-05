const {
  Libro,
  Editorial,
  Autor,
  Genero,
  Nacionalidad,
  LibroAutor,
  LibroGenero,
  Venta,
  Resena,
} = require("../models");

const RELACIONES_LIBRO = [
  {
    model: Editorial,
    as: "editorial",
    attributes: [
      "id_editorial",
      "nombre",
      "email",
      "telefono",
      "pais",
      "provincia",
      "ciudad",
    ],
  },
  {
    model: Autor,
    as: "autores",
    attributes: ["id_autor", "nombre", "id_nacionalidad"],
    through: { attributes: [] },
    include: [
      {
        model: Nacionalidad,
        as: "nacionalidad",
        attributes: ["id_nacionalidad", "nombre_nacionalidad"],
      },
    ],
  },
  {
    model: Genero,
    as: "generos",
    attributes: ["id_genero", "nombreGenero", "id_posicion", "id_forma_gramatical"],
    through: { attributes: [] },
  },
];

const formatearLibroConRelaciones = (libroInstance) => {
  const item = libroInstance.toJSON ? libroInstance.toJSON() : libroInstance;
  const autoresArr = Array.isArray(item.autores) ? item.autores : [];
  const generosArr = Array.isArray(item.generos) ? item.generos : [];

  const autorPrincipal = autoresArr[0] || null;
  const generoPrincipal = generosArr[0] || null;

  const autoresLista =
    autoresArr.map((a) => a.nombre).join(", ") || "Sin autor asignado";
  const generosLista =
    generosArr.map((g) => g.nombreGenero).join(", ") || "General";

  const codigoIsbn = `LIB-${String(item.id_libro).padStart(4, "0")}`;

  return {
    id_libro: item.id_libro,
    codigo_isbn: codigoIsbn,
    titulo: item.titulo,
    numPaginas: Number(item.numPaginas ?? 0),
    precioLibro: Number(item.precioLibro ?? 0),
    stock: Number(item.stock ?? 0),
    id_editorial: item.id_editorial,
    editorial_nombre: item.editorial?.nombre || `Editorial #${item.id_editorial}`,
    editorial_pais: item.editorial?.pais || "",
    editorial_ciudad: item.editorial?.ciudad || "",
    id_autor: autorPrincipal?.id_autor || null,
    autor_nombre: autorPrincipal?.nombre || autoresLista,
    autor_nacionalidad:
      autorPrincipal?.nacionalidad?.nombre_nacionalidad || "",
    autores_lista: autoresLista,
    id_genero: generoPrincipal?.id_genero || null,
    genero_nombre: generoPrincipal?.nombreGenero || generosLista,
    generos_lista: generosLista,
    editorial: item.editorial || null,
    autores: autoresArr,
    generos: generosArr,
    // Propiedades espejo de compatibilidad
    id_producto: item.id_libro,
    codigo_sku: codigoIsbn,
    nombre: item.titulo,
    precio_venta: Number(item.precioLibro ?? 0),
    stock_minimo: Number(item.stock ?? 0),
    id_categoria: generoPrincipal?.id_genero || item.id_editorial,
    categoria_nombre: generoPrincipal?.nombreGenero || generosLista,
  };
};

const validarPayloadLibro = (body) => {
  const errores = [];

  const titulo = (body?.titulo ?? body?.nombre ?? "").toString().trim();
  const id_editorial = Number(
    body?.id_editorial ?? body?.editorialId ?? body?.id_proveedor ?? 1
  );
  const numPaginas = Number(body?.numPaginas ?? body?.paginas ?? 100);
  const precioLibro = Number(
    body?.precioLibro ?? body?.precio_venta ?? body?.precio ?? 0
  );
  const stock =
    body?.stock !== undefined
      ? Number(body.stock)
      : Number(body?.stock_minimo ?? 0);
  const id_autor = body?.id_autor ? Number(body.id_autor) : null;
  const id_genero =
    body?.id_genero !== undefined && body?.id_genero !== ""
      ? Number(body.id_genero)
      : body?.id_categoria
      ? Number(body.id_categoria)
      : null;

  if (!titulo || titulo.length < 2) {
    errores.push("El campo 'titulo' del libro es obligatorio (mínimo 2 caracteres).");
  }

  if (!Number.isInteger(id_editorial) || id_editorial <= 0) {
    errores.push("Debe seleccionar una editorial válida ('id_editorial').");
  }

  if (Number.isNaN(numPaginas) || numPaginas <= 0) {
    errores.push("El número de páginas ('numPaginas') debe ser mayor a 0.");
  }

  if (Number.isNaN(precioLibro) || precioLibro <= 0) {
    errores.push("El precio del libro ('precioLibro') debe ser mayor a 0.");
  }

  if (Number.isNaN(stock) || stock < 0) {
    errores.push("El 'stock' debe ser un número entero mayor o igual a 0.");
  }

  return {
    esValido: errores.length === 0,
    errores,
    datosNormalizados: {
      titulo: titulo.slice(0, 150),
      id_editorial,
      numPaginas: Math.round(numPaginas),
      precioLibro: Math.round(precioLibro),
      stock: Math.round(stock),
      id_autor,
      id_genero,
    },
  };
};

// 1. GET /api/libros (y /api/productos) — Listar todos los libros con Editorial, Autores y Géneros
exports.obtenerProductos = async (req, res) => {
  try {
    const libros = await Libro.findAll({
      include: RELACIONES_LIBRO,
      order: [["id_libro", "DESC"]],
    });

    const respuesta = libros.map(formatearLibroConRelaciones);
    return res.status(200).json(respuesta);
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al obtener el catálogo de libros",
      detalle: error.message,
    });
  }
};

// 2. GET /api/libros/:id — Obtener un libro por ID con todas sus relaciones
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const libro = await Libro.findByPk(id, {
      include: RELACIONES_LIBRO,
    });

    if (!libro) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    return res.status(200).json(formatearLibroConRelaciones(libro));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al consultar el libro",
      detalle: error.message,
    });
  }
};

// 3. POST /api/libros — Crear un libro y sincronizar libros_autores y libro_genero
exports.agregarProducto = async (req, res) => {
  try {
    const { esValido, errores, datosNormalizados } = validarPayloadLibro(req.body);
    if (!esValido) {
      return res.status(400).json({
        error: "Validación fallida al registrar el libro",
        detalles: errores,
      });
    }

    const editorialExiste = await Editorial.findByPk(datosNormalizados.id_editorial);
    if (!editorialExiste) {
      return res.status(400).json({
        error: `La editorial seleccionada (id_editorial: ${datosNormalizados.id_editorial}) no existe en la base de datos`,
      });
    }

    if (datosNormalizados.id_autor) {
      const autorExiste = await Autor.findByPk(datosNormalizados.id_autor);
      if (!autorExiste) {
        return res.status(400).json({
          error: `El autor seleccionado (id_autor: ${datosNormalizados.id_autor}) no existe en la base de datos`,
        });
      }
    }

    if (datosNormalizados.id_genero) {
      const generoExiste = await Genero.findByPk(datosNormalizados.id_genero);
      if (!generoExiste) {
        return res.status(400).json({
          error: `El género literario seleccionado (id_genero: ${datosNormalizados.id_genero}) no existe en la base de datos`,
        });
      }
    }

    const nuevoLibro = await Libro.create({
      titulo: datosNormalizados.titulo,
      id_editorial: datosNormalizados.id_editorial,
      numPaginas: datosNormalizados.numPaginas,
      precioLibro: datosNormalizados.precioLibro,
      stock: datosNormalizados.stock,
    });

    // Vincular autor en `libros_autores`
    if (datosNormalizados.id_autor && LibroAutor) {
      await LibroAutor.create({
        id_libro: nuevoLibro.id_libro,
        id_autor: datosNormalizados.id_autor,
      });
    }

    // Vincular género en `libro_genero`
    if (datosNormalizados.id_genero && LibroGenero) {
      await LibroGenero.create({
        id_libro: nuevoLibro.id_libro,
        id_genero: datosNormalizados.id_genero,
        id_subgenero: datosNormalizados.id_genero,
      });
    }

    const libroCompleto = await Libro.findByPk(nuevoLibro.id_libro, {
      include: RELACIONES_LIBRO,
    });

    return res.status(201).json(formatearLibroConRelaciones(libroCompleto));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al crear el libro",
      detalle: error.message,
    });
  }
};

// 4. PUT /api/libros/:id — Actualizar un libro y sus relaciones en libros_autores y libro_genero
exports.actualizarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const libroExistente = await Libro.findByPk(id);
    if (!libroExistente) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const { esValido, errores, datosNormalizados } = validarPayloadLibro(req.body);
    if (!esValido) {
      return res.status(400).json({
        error: "Validación fallida al actualizar el libro",
        detalles: errores,
      });
    }

    const editorialExiste = await Editorial.findByPk(datosNormalizados.id_editorial);
    if (!editorialExiste) {
      return res.status(400).json({
        error: `La editorial seleccionada (id_editorial: ${datosNormalizados.id_editorial}) no existe en la base de datos`,
      });
    }

    await libroExistente.update({
      titulo: datosNormalizados.titulo,
      id_editorial: datosNormalizados.id_editorial,
      numPaginas: datosNormalizados.numPaginas,
      precioLibro: datosNormalizados.precioLibro,
      stock: datosNormalizados.stock,
    });

    if (datosNormalizados.id_autor && LibroAutor) {
      await LibroAutor.destroy({ where: { id_libro: id } });
      await LibroAutor.create({
        id_libro: id,
        id_autor: datosNormalizados.id_autor,
      });
    }

    if (datosNormalizados.id_genero && LibroGenero) {
      await LibroGenero.destroy({ where: { id_libro: id } });
      await LibroGenero.create({
        id_libro: id,
        id_genero: datosNormalizados.id_genero,
        id_subgenero: datosNormalizados.id_genero,
      });
    }

    const libroActualizado = await Libro.findByPk(id, {
      include: RELACIONES_LIBRO,
    });

    return res.status(200).json(formatearLibroConRelaciones(libroActualizado));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno al actualizar el libro",
      detalle: error.message,
    });
  }
};

// 5. DELETE /api/libros/:id — Eliminar libro validando integridad con ventas y reseñas
exports.eliminarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const libro = await Libro.findByPk(id);
    if (!libro) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const [ventasAsociadas, resenasAsociadas] = await Promise.all([
      Venta ? Venta.count({ where: { id_libro: id } }) : 0,
      Resena ? Resena.count({ where: { id_libro: id } }) : 0,
    ]);

    if (ventasAsociadas > 0 || resenasAsociadas > 0) {
      return res.status(409).json({
        error:
          "Conflicto de integridad referencial: no se puede eliminar el libro porque tiene ventas o reseñas registradas",
        dependencias: {
          ventas: ventasAsociadas,
          resenas: resenasAsociadas,
        },
      });
    }

    // Limpiar relaciones puente en libros_autores y libro_genero antes de eliminar el libro
    if (LibroAutor) {
      await LibroAutor.destroy({ where: { id_libro: id } });
    }
    if (LibroGenero) {
      await LibroGenero.destroy({ where: { id_libro: id } });
    }

    await libro.destroy();

    return res.status(200).json({
      mensaje: "Libro eliminado exitosamente",
      id_libro: id,
      id_producto: id,
    });
  } catch (error) {
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        error:
          "Conflicto de integridad referencial: existen registros dependientes asociados a este libro",
      });
    }

    return res.status(500).json({
      error: "Error interno al eliminar el libro",
      detalle: error.message,
    });
  }
};

// 6. GET /api/autores — Listar autores con su nacionalidad
exports.obtenerAutores = async (req, res) => {
  try {
    const autores = await Autor.findAll({
      include: [
        {
          model: Nacionalidad,
          as: "nacionalidad",
          attributes: ["id_nacionalidad", "nombre_nacionalidad"],
        },
      ],
      order: [["id_autor", "ASC"]],
    });

    const respuesta = autores.map((a) => {
      const json = a.toJSON ? a.toJSON() : a;
      return {
        ...json,
        nacionalidad_nombre:
          json.nacionalidad?.nombre_nacionalidad || "Internacional",
      };
    });

    return res.status(200).json(respuesta);
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener el listado de autores",
      detalle: error.message,
    });
  }
};

exports.obtenerLibros = exports.obtenerProductos;
exports.obtenerLibroPorId = exports.obtenerProductoPorId;
exports.crearLibro = exports.agregarProducto;
exports.actualizarLibro = exports.actualizarProducto;
exports.eliminarLibro = exports.eliminarProducto;
exports.crearProducto = exports.agregarProducto;
exports.getProductos = exports.obtenerProductos;
exports.getProducto = exports.obtenerProductoPorId;
