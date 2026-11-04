const pool = require('../config/db');

const getAllTiposMovimiento = async () => {
  const query = `
    SELECT id_tipo_movimiento, codigo, nombre, naturaleza, descripcion
    FROM tipos_movimiento
    ORDER BY id_tipo_movimiento DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getTipoMovimientoById = async (id) => {
  const query = `
    SELECT id_tipo_movimiento, codigo, nombre, naturaleza, descripcion
    FROM tipos_movimiento
    WHERE id_tipo_movimiento = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createTipoMovimiento = async (data) => {
  const { codigo, nombre, naturaleza, descripcion } = data;
  const query = `
    INSERT INTO tipos_movimiento (codigo, nombre, naturaleza, descripcion)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    codigo,
    nombre,
    naturaleza,
    descripcion ?? null
  ]);
  return { id_tipo_movimiento: result.insertId, ...data };
};

const updateTipoMovimiento = async (id, data) => {
  const { codigo, nombre, naturaleza, descripcion } = data;
  const query = `
    UPDATE tipos_movimiento
    SET codigo = ?, nombre = ?, naturaleza = ?, descripcion = ?
    WHERE id_tipo_movimiento = ?
  `;
  const [result] = await pool.execute(query, [
    codigo,
    nombre,
    naturaleza,
    descripcion ?? null,
    id
  ]);
  return result.affectedRows;
};

const deleteTipoMovimiento = async (id) => {
  const query = `DELETE FROM tipos_movimiento WHERE id_tipo_movimiento = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllTiposMovimiento,
  getTipoMovimientoById,
  createTipoMovimiento,
  updateTipoMovimiento,
  deleteTipoMovimiento
};

