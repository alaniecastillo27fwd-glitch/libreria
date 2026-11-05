const pool = require('../config/db');

const getAllUnidadesMedida = async () => {
  const query = `
    SELECT id_unidad, nombre, abreviatura
    FROM unidades_medida
    ORDER BY id_unidad DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getUnidadMedidaById = async (id) => {
  const query = `
    SELECT id_unidad, nombre, abreviatura
    FROM unidades_medida
    WHERE id_unidad = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createUnidadMedida = async (data) => {
  const { nombre, abreviatura } = data;
  const query = `
    INSERT INTO unidades_medida (nombre, abreviatura)
    VALUES (?, ?)
  `;
  const [result] = await pool.execute(query, [nombre, abreviatura]);
  return { id_unidad: result.insertId, ...data };
};

const updateUnidadMedida = async (id, data) => {
  const { nombre, abreviatura } = data;
  const query = `
    UPDATE unidades_medida
    SET nombre = ?, abreviatura = ?
    WHERE id_unidad = ?
  `;
  const [result] = await pool.execute(query, [nombre, abreviatura, id]);
  return result.affectedRows;
};

const deleteUnidadMedida = async (id) => {
  const query = `DELETE FROM unidades_medida WHERE id_unidad = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllUnidadesMedida,
  getUnidadMedidaById,
  createUnidadMedida,
  updateUnidadMedida,
  deleteUnidadMedida
};

