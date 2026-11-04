const pool = require('../config/db');

const getAllMarcas = async () => {
  const query = `
    SELECT id_marca, nombre, pais_origen, descripcion
    FROM marcas
    ORDER BY id_marca DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getMarcaById = async (id) => {
  const query = `
    SELECT id_marca, nombre, pais_origen, descripcion
    FROM marcas
    WHERE id_marca = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createMarca = async (data) => {
  const { nombre, pais_origen, descripcion } = data;
  const query = `
    INSERT INTO marcas (nombre, pais_origen, descripcion)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(query, [nombre, pais_origen, descripcion ?? null]);
  return { id_marca: result.insertId, ...data };
};

const updateMarca = async (id, data) => {
  const { nombre, pais_origen, descripcion } = data;
  const query = `
    UPDATE marcas
    SET nombre = ?, pais_origen = ?, descripcion = ?
    WHERE id_marca = ?
  `;
  const [result] = await pool.execute(query, [nombre, pais_origen, descripcion ?? null, id]);
  return result.affectedRows;
};

const deleteMarca = async (id) => {
  const query = `DELETE FROM marcas WHERE id_marca = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
};

