const { Producto, Categoria, Marca, UnidadMedida, PRODUCTOS_SEMILLA } = require("../models/");

const CATEGORIAS_MAP = {
  1: "Pigmentos y Óleos Profesionales",
  2: "Lienzos y Soportes Rígidos",
  3: "Pinceles y Espátulas Técnicas",
  4: "Papeles Técnicos y Acuarela"
};

const MARCAS_MAP = {
  1: "Winsor & Newton",
  2: "Fabriano",
  3: "Escoda",
  4: "Sennelier"
};

const UNIDADES_MAP = {
  1: "TUB-37ML",
  2: "PLG-56X76",
  3: "CAJ-12U",
  4: "ROL-10M"
};

// Catálogo inicial en memoria como respaldo inmediato y semilla automática
let memoriaProductos = (PRODUCTOS_SEMILLA || []).map((p, idx) => ({
  id_producto: idx + 1,
  ...p,
  categoria_nombre: CATEGORIAS_MAP[p.id_categoria] || "General",
  marca_nombre: MARCAS_MAP[p.id_marca] || "Genérica",
  unidad_abreviatura: UNIDADES_MAP[p.id_unidad] || "UND"
}));

const enriquecerProducto = (item) => ({
  ...item,
  categoria_nombre: item.categoria?.nombre || CATEGORIAS_MAP[item.id_categoria] || "General",
  marca_nombre: item.marca?.nombre || MARCAS_MAP[item.id_marca] || "Genérica",
  unidad_abreviatura: item.unidad?.abreviatura || UNIDADES_MAP[item.id_unidad] || "UND"
});

exports.agregarProducto = async (req, res) => {
  try {
    const newProducto = await Producto.create(req.body);
    const json = enriquecerProducto(newProducto.toJSON());
    return res.status(201).json(json);
  } catch {
    const nuevoId =
      memoriaProductos.length > 0
        ? Math.max(...memoriaProductos.map((p) => p.id_producto)) + 1
        : 1;
    const creado = enriquecerProducto({
      id_producto: nuevoId,
      ...req.body
    });
    memoriaProductos = [creado, ...memoriaProductos];
    return res.status(201).json(creado);
  }
};

exports.eliminarProducto = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const filasEliminadas = await Producto.destroy({
      where: { id_producto: id }
    });

    if (!filasEliminadas) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({ message: "Producto eliminado", mensaje: "Producto eliminado exitosamente" });
  } catch {
    const existe = memoriaProductos.some((p) => p.id_producto === id);
    if (!existe) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    memoriaProductos = memoriaProductos.filter((p) => p.id_producto !== id);
    return res.json({ message: "Producto eliminado", mensaje: "Producto eliminado exitosamente" });
  }
};

exports.actualizarProducto = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await Producto.update(req.body, {
      where: { id_producto: id }
    });

    const productoActualizado = await Producto.findByPk(id);
    const base = productoActualizado ? productoActualizado.toJSON() : { id_producto: id, ...req.body };
    return res.json({
      message: "Producto actualizado",
      ...enriquecerProducto(base)
    });
  } catch {
    const idx = memoriaProductos.findIndex((p) => p.id_producto === id);
    if (idx === -1) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const actualizado = enriquecerProducto({
      ...memoriaProductos[idx],
      ...req.body,
      id_producto: id
    });
    memoriaProductos[idx] = actualizado;
    return res.json({
      message: "Producto actualizado",
      ...actualizado
    });
  }
};

exports.obtenerProductos = async (req, res) => {
  try {
    let count = await Producto.count();
    if (count === 0 && Array.isArray(PRODUCTOS_SEMILLA) && PRODUCTOS_SEMILLA.length > 0) {
      await Producto.bulkCreate(PRODUCTOS_SEMILLA, { ignoreDuplicates: true });
    }

    const productos = await Producto.findAll({
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre"] },
        { model: Marca, as: "marca", attributes: ["nombre"] },
        { model: UnidadMedida, as: "unidad", attributes: ["abreviatura"] }
      ],
      order: [["id_producto", "DESC"]]
    });

    const respuesta = productos.map((prod) => enriquecerProducto(prod.toJSON()));
    return res.json(respuesta);
  } catch {
    return res.json(memoriaProductos);
  }
};

exports.obtenerProductoPorId = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Categoria, as: "categoria", attributes: ["nombre"] },
        { model: Marca, as: "marca", attributes: ["nombre"] },
        { model: UnidadMedida, as: "unidad", attributes: ["abreviatura"] }
      ]
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado", error: "Producto no encontrado" });
    }

    return res.json(enriquecerProducto(producto.toJSON()));
  } catch {
    const encontrado = memoriaProductos.find((p) => p.id_producto === id);
    if (!encontrado) {
      return res.status(404).json({ message: "Producto no encontrado", error: "Producto no encontrado" });
    }
    return res.json(encontrado);
  }
};

exports.crearProducto = exports.agregarProducto;
exports.getProductos = exports.obtenerProductos;
exports.getProducto = exports.obtenerProductoPorId;
