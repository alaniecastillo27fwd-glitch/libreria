const pool = require('../config/db');

const getAllCategorias = async () => {
  const query = `
    SELECT id_categoria, nombre, descripcion, fecha_creacion
    FROM categorias
    ORDER BY id_categoria DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getCategoriaById = async (id) => {
  const query = `
    SELECT id_categoria, nombre, descripcion, fecha_creacion
    FROM categorias
    WHERE id_categoria = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createCategoria = async (data) => {
  const { nombre, descripcion } = data;
  const query = `
    INSERT INTO categorias (nombre, descripcion)
    VALUES (?, ?)
  `;
  const [result] = await pool.execute(query, [nombre, descripcion ?? null]);
  return { id_categoria: result.insertId, ...data };
};

const updateCategoria = async (id, data) => {
  const { nombre, descripcion } = data;
  const query = `
    UPDATE categorias
    SET nombre = ?, descripcion = ?
    WHERE id_categoria = ?
  `;
  const [result] = await pool.execute(query, [nombre, descripcion ?? null, id]);
  return result.affectedRows;
};

const deleteCategoria = async (id) => {
  const query = `DELETE FROM categorias WHERE id_categoria = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};

