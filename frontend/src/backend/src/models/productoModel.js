const pool = require('../config/db');

/**
 * Obtiene todos los productos con sus nombres descriptivos de categoría, marca y unidad de medida.
 * @returns {Promise<Array>} Arreglo de productos.
 */
const getAllProductos = async () => {
  const query = `
    SELECT
      p.id_producto,
      p.codigo_sku,
      p.nombre,
      p.descripcion,
      p.precio_compra,
      p.precio_venta,
      p.stock_minimo,
      p.id_categoria,
      p.id_marca,
      p.id_unidad,
      c.nombre AS categoria_nombre,
      m.nombre AS marca_nombre,
      u.abreviatura AS unidad_abreviatura
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN marcas m ON p.id_marca = m.id_marca
    INNER JOIN unidades_medida u ON p.id_unidad = u.id_unidad
    ORDER BY p.id_producto DESC
  `;

  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Obtiene un producto específico por su ID con sus relaciones descriptivas.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<Object|null>} Objeto del producto o null si no existe.
 */
const getProductoById = async (id) => {
  const query = `
    SELECT
      p.id_producto,
      p.codigo_sku,
      p.nombre,
      p.descripcion,
      p.precio_compra,
      p.precio_venta,
      p.stock_minimo,
      p.id_categoria,
      p.id_marca,
      p.id_unidad,
      c.nombre AS categoria_nombre,
      m.nombre AS marca_nombre,
      u.abreviatura AS unidad_abreviatura
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    INNER JOIN marcas m ON p.id_marca = m.id_marca
    INNER JOIN unidades_medida u ON p.id_unidad = u.id_unidad
    WHERE p.id_producto = ?
  `;

  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

/**
 * Inserta un nuevo producto en la base de datos.
 * @param {Object} data - Datos del producto a registrar.
 * @returns {Promise<Object>} Objeto con el ID generado y los datos insertados.
 */
const createProducto = async (data) => {
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
  } = data;

  const query = `
    INSERT INTO productos (
      codigo_sku,
      nombre,
      descripcion,
      precio_compra,
      precio_venta,
      stock_minimo,
      id_categoria,
      id_marca,
      id_unidad
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    codigo_sku,
    nombre,
    descripcion ?? null,
    precio_compra,
    precio_venta,
    stock_minimo,
    id_categoria,
    id_marca,
    id_unidad
  ];

  const [result] = await pool.execute(query, values);
  return { id_producto: result.insertId, ...data };
};

/**
 * Actualiza todos los atributos de un producto existente según su ID.
 * @param {number|string} id - ID del producto a actualizar.
 * @param {Object} data - Nuevos datos del producto.
 * @returns {Promise<number>} Número de filas afectadas.
 */
const updateProducto = async (id, data) => {
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
  } = data;

  const query = `
    UPDATE productos
    SET
      codigo_sku = ?,
      nombre = ?,
      descripcion = ?,
      precio_compra = ?,
      precio_venta = ?,
      stock_minimo = ?,
      id_categoria = ?,
      id_marca = ?,
      id_unidad = ?
    WHERE id_producto = ?
  `;

  const values = [
    codigo_sku,
    nombre,
    descripcion ?? null,
    precio_compra,
    precio_venta,
    stock_minimo,
    id_categoria,
    id_marca,
    id_unidad,
    id
  ];

  const [result] = await pool.execute(query, values);
  return result.affectedRows;
};

/**
 * Elimina un producto por su ID.
 * @param {number|string} id - ID del producto a eliminar.
 * @returns {Promise<number>} Número de filas afectadas.
 */
const deleteProducto = async (id) => {
  const query = `
    DELETE FROM productos
    WHERE id_producto = ?
  `;

  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};

