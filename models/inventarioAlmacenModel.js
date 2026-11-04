const pool = require('../config/db');

const getAllInventarioAlmacen = async () => {
  const query = `
    SELECT
      ia.id_inventario_almacen,
      ia.producto_id,
      ia.almacen_id,
      ia.stock_actual,
      ia.stock_minimo,
      ia.stock_maximo,
      ia.pasillo_estante,
      ia.ultima_conciliacion,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre
    FROM inventario_almacen ia
    INNER JOIN productos p ON ia.producto_id = p.id_producto
    INNER JOIN almacenes a ON ia.almacen_id = a.id_almacen
    ORDER BY ia.id_inventario_almacen DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getInventarioAlmacenById = async (id) => {
  const query = `
    SELECT
      ia.id_inventario_almacen,
      ia.producto_id,
      ia.almacen_id,
      ia.stock_actual,
      ia.stock_minimo,
      ia.stock_maximo,
      ia.pasillo_estante,
      ia.ultima_conciliacion,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre
    FROM inventario_almacen ia
    INNER JOIN productos p ON ia.producto_id = p.id_producto
    INNER JOIN almacenes a ON ia.almacen_id = a.id_almacen
    WHERE ia.id_inventario_almacen = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createInventarioAlmacen = async (data) => {
  const { producto_id, almacen_id, stock_actual, stock_minimo, stock_maximo, pasillo_estante } = data;
  const query = `
    INSERT INTO inventario_almacen (
      producto_id,
      almacen_id,
      stock_actual,
      stock_minimo,
      stock_maximo,
      pasillo_estante
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    producto_id,
    almacen_id,
    stock_actual ?? 0,
    stock_minimo ?? 10,
    stock_maximo ?? 500,
    pasillo_estante
  ]);
  return { id_inventario_almacen: result.insertId, ...data };
};

const updateInventarioAlmacen = async (id, data) => {
  const { producto_id, almacen_id, stock_actual, stock_minimo, stock_maximo, pasillo_estante } = data;
  const query = `
    UPDATE inventario_almacen
    SET
      producto_id = ?,
      almacen_id = ?,
      stock_actual = ?,
      stock_minimo = ?,
      stock_maximo = ?,
      pasillo_estante = ?,
      ultima_conciliacion = CURRENT_TIMESTAMP
    WHERE id_inventario_almacen = ?
  `;
  const [result] = await pool.execute(query, [
    producto_id,
    almacen_id,
    stock_actual,
    stock_minimo,
    stock_maximo,
    pasillo_estante,
    id
  ]);
  return result.affectedRows;
};

const deleteInventarioAlmacen = async (id) => {
  const query = `DELETE FROM inventario_almacen WHERE id_inventario_almacen = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllInventarioAlmacen,
  getInventarioAlmacenById,
  createInventarioAlmacen,
  updateInventarioAlmacen,
  deleteInventarioAlmacen
};

