const productoModel = require('../models/productoModel');

/**
 * Valida que un valor sea un entero positivo (> 0).
 * @param {*} valor
 * @returns {boolean}
 */
const esEnteroPositivo = (valor) => {
  const num = Number(valor);
  return Number.isInteger(num) && num > 0;
};

/**
 * Valida de forma estricta los atributos del cuerpo de la petición para crear o actualizar un producto.
 * @param {Object} body - req.body
 * @returns {{ error: string|null, data: Object|null }}
 */
const validarPayloadProducto = (body) => {
  if (!body || typeof body !== 'object') {
    return { error: 'El cuerpo de la petición es inválido o está vacío', data: null };
  }

  const {
    codigo_sku,
    nombre,
    descripcion,
    precio_compra,
    precio_venta,
    stock_minimo,
    id_categoria,
    id_marca,
    id_unidad
  } = body;

  if (typeof codigo_sku !== 'string' || codigo_sku.trim() === '') {
    return { error: 'El campo codigo_sku es obligatorio y debe ser una cadena de texto no vacía', data: null };
  }

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return { error: 'El campo nombre es obligatorio y debe ser una cadena de texto no vacía', data: null };
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    return { error: 'El campo descripcion debe ser una cadena de texto válida', data: null };
  }

  const numPrecioCompra = Number(precio_compra);
  if (
    precio_compra === undefined ||
    precio_compra === null ||
    precio_compra === '' ||
    typeof precio_compra === 'boolean' ||
    Number.isNaN(numPrecioCompra) ||
    !Number.isFinite(numPrecioCompra) ||
    numPrecioCompra <= 0
  ) {
    return { error: 'El campo precio_compra es obligatorio y debe ser un número mayor a 0', data: null };
  }

  const numPrecioVenta = Number(precio_venta);
  if (
    precio_venta === undefined ||
    precio_venta === null ||
    precio_venta === '' ||
    typeof precio_venta === 'boolean' ||
    Number.isNaN(numPrecioVenta) ||
    !Number.isFinite(numPrecioVenta) ||
    numPrecioVenta <= 0
  ) {
    return { error: 'El campo precio_venta es obligatorio y debe ser un número mayor a 0', data: null };
  }

  const numStockMinimo = Number(stock_minimo);
  if (
    stock_minimo === undefined ||
    stock_minimo === null ||
    stock_minimo === '' ||
    typeof stock_minimo === 'boolean' ||
    !Number.isInteger(numStockMinimo) ||
    numStockMinimo < 0
  ) {
    return { error: 'El campo stock_minimo es obligatorio y debe ser un número entero mayor o igual a 0', data: null };
  }

  if (typeof id_categoria === 'boolean' || !esEnteroPositivo(id_categoria)) {
    return { error: 'El campo id_categoria es obligatorio y debe ser un entero positivo válido', data: null };
  }

  if (typeof id_marca === 'boolean' || !esEnteroPositivo(id_marca)) {
    return { error: 'El campo id_marca es obligatorio y debe ser un entero positivo válido', data: null };
  }

  if (typeof id_unidad === 'boolean' || !esEnteroPositivo(id_unidad)) {
    return { error: 'El campo id_unidad es obligatorio y debe ser un entero positivo válido', data: null };
  }

  return {
    error: null,
    data: {
      codigo_sku: codigo_sku.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      precio_compra: Number(numPrecioCompra.toFixed(2)),
      precio_venta: Number(numPrecioVenta.toFixed(2)),
      stock_minimo: numStockMinimo,
      id_categoria: Number(id_categoria),
      id_marca: Number(id_marca),
      id_unidad: Number(id_unidad)
    }
  };
};

/**
 * 1. Listar todos los productos (GET /api/productos)
 */
const getProductos = async (req, res) => {
  try {
    const productos = await productoModel.getAllProductos();
    return res.status(200).json(productos);
  } catch (err) {
    return res.status(500).json({
      error: 'Error interno del servidor al obtener la lista de productos',
      detalle: err.message
    });
  }
};

/**
 * 2. Obtener un producto por ID (GET /api/productos/:id)
 */
const getProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esEnteroPositivo(id)) {
      return res.status(400).json({
        error: 'El parámetro id debe ser un número entero positivo válido'
      });
    }

    const producto = await productoModel.getProductoById(Number(id));

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json(producto);
  } catch (err) {
    return res.status(500).json({
      error: 'Error interno del servidor al consultar el producto',
      detalle: err.message
    });
  }
};

/**
 * 3. Crear un nuevo producto (POST /api/productos)
 */
const crearProducto = async (req, res) => {
  try {
    const { error, data } = validarPayloadProducto(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const nuevoProducto = await productoModel.createProducto(data);
    return res.status(201).json(nuevoProducto);
  } catch (err) {
    return res.status(500).json({
      error: 'Error interno del servidor al crear el producto',
      detalle: err.message
    });
  }
};

/**
 * 4. Actualizar un producto existente (PUT /api/productos/:id)
 */
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esEnteroPositivo(id)) {
      return res.status(400).json({
        error: 'El parámetro id debe ser un número entero positivo válido'
      });
    }

    const { error, data } = validarPayloadProducto(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const filasAfectadas = await productoModel.updateProducto(Number(id), data);

    if (filasAfectadas === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      id_producto: Number(id),
      ...data
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Error interno del servidor al actualizar el producto',
      detalle: err.message
    });
  }
};

/**
 * 5. Eliminar un producto (DELETE /api/productos/:id)
 */
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esEnteroPositivo(id)) {
      return res.status(400).json({
        error: 'El parámetro id debe ser un número entero positivo válido'
      });
    }

    const filasAfectadas = await productoModel.deleteProducto(Number(id));

    if (filasAfectadas === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      mensaje: 'Producto eliminado exitosamente'
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Error interno del servidor al eliminar el producto',
      detalle: err.message
    });
  }
};

module.exports = {
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};

