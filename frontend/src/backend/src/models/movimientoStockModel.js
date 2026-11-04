const pool = require('../config/db');

const getAllMovimientosStock = async () => {
  const query = `
    SELECT
      ms.id_movimiento_stock,
      ms.folio_movimiento,
      ms.cantidad,
      ms.costo_unitario,
      ms.fecha,
      ms.observaciones,
      ms.producto_id,
      ms.almacen_id,
      ms.tipo_movimiento_id,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre,
      tm.nombre AS tipo_movimiento_nombre,
      tm.naturaleza
    FROM movimientos_stock ms
    INNER JOIN productos p ON ms.producto_id = p.id_producto
    INNER JOIN almacenes a ON ms.almacen_id = a.id_almacen
    INNER JOIN tipos_movimiento tm ON ms.tipo_movimiento_id = tm.id_tipo_movimiento
    ORDER BY ms.id_movimiento_stock DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getMovimientoStockById = async (id) => {
  const query = `
    SELECT
      ms.id_movimiento_stock,
      ms.folio_movimiento,
      ms.cantidad,
      ms.costo_unitario,
      ms.fecha,
      ms.observaciones,
      ms.producto_id,
      ms.almacen_id,
      ms.tipo_movimiento_id,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_nombre,
      tm.nombre AS tipo_movimiento_nombre,
      tm.naturaleza
    FROM movimientos_stock ms
    INNER JOIN productos p ON ms.producto_id = p.id_producto
    INNER JOIN almacenes a ON ms.almacen_id = a.id_almacen
    INNER JOIN tipos_movimiento tm ON ms.tipo_movimiento_id = tm.id_tipo_movimiento
    WHERE ms.id_movimiento_stock = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createMovimientoStock = async (data) => {
  const {
    folio_movimiento,
    cantidad,
    costo_unitario,
    observaciones,
    producto_id,
    almacen_id,
    tipo_movimiento_id
  } = data;

  const query = `
    INSERT INTO movimientos_stock (
      folio_movimiento,
      cantidad,
      costo_unitario,
      observaciones,
      producto_id,
      almacen_id,
      tipo_movimiento_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    folio_movimiento,
    cantidad,
    costo_unitario,
    observaciones ?? null,
    producto_id,
    almacen_id,
    tipo_movimiento_id
  ]);
  return { id_movimiento_stock: result.insertId, ...data };
};

const updateMovimientoStock = async (id, data) => {
  const {
    folio_movimiento,
    cantidad,
    costo_unitario,
    observaciones,
    producto_id,
    almacen_id,
    tipo_movimiento_id
  } = data;

  const query = `
    UPDATE movimientos_stock
    SET
      folio_movimiento = ?,
      cantidad = ?,
      costo_unitario = ?,
      observaciones = ?,
      producto_id = ?,
      almacen_id = ?,
      tipo_movimiento_id = ?
    WHERE id_movimiento_stock = ?
  `;
  const [result] = await pool.execute(query, [
    folio_movimiento,
    cantidad,
    costo_unitario,
    observaciones ?? null,
    producto_id,
    almacen_id,
    tipo_movimiento_id,
    id
  ]);
  return result.affectedRows;
};

const deleteMovimientoStock = async (id) => {
  const query = `DELETE FROM movimientos_stock WHERE id_movimiento_stock = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllMovimientosStock,
  getMovimientoStockById,
  createMovimientoStock,
  updateMovimientoStock,
  deleteMovimientoStock
};

