const pool = require('../config/db');

const getAllAlmacenes = async () => {
  const query = `
    SELECT id_almacen, codigo_almacen, nombre, ubicacion, tipo_ambiente
    FROM almacenes
    ORDER BY id_almacen DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getAlmacenById = async (id) => {
  const query = `
    SELECT id_almacen, codigo_almacen, nombre, ubicacion, tipo_ambiente
    FROM almacenes
    WHERE id_almacen = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createAlmacen = async (data) => {
  const { codigo_almacen, nombre, ubicacion, tipo_ambiente } = data;
  const query = `
    INSERT INTO almacenes (codigo_almacen, nombre, ubicacion, tipo_ambiente)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    codigo_almacen,
    nombre,
    ubicacion,
    tipo_ambiente || 'ESTANDAR'
  ]);
  return { id_almacen: result.insertId, ...data };
};

const updateAlmacen = async (id, data) => {
  const { codigo_almacen, nombre, ubicacion, tipo_ambiente } = data;
  const query = `
    UPDATE almacenes
    SET codigo_almacen = ?, nombre = ?, ubicacion = ?, tipo_ambiente = ?
    WHERE id_almacen = ?
  `;
  const [result] = await pool.execute(query, [
    codigo_almacen,
    nombre,
    ubicacion,
    tipo_ambiente || 'ESTANDAR',
    id
  ]);
  return result.affectedRows;
};

const deleteAlmacen = async (id) => {
  const query = `DELETE FROM almacenes WHERE id_almacen = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllAlmacenes,
  getAlmacenById,
  createAlmacen,
  updateAlmacen,
  deleteAlmacen
};

