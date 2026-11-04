const pool = require('../config/db');

const getAllProveedores = async () => {
  const query = `
    SELECT id_proveedor, identificacion_fiscal, nombre, contacto, telefono, correo_comercial, direccion
    FROM proveedores
    ORDER BY id_proveedor DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getProveedorById = async (id) => {
  const query = `
    SELECT id_proveedor, identificacion_fiscal, nombre, contacto, telefono, correo_comercial, direccion
    FROM proveedores
    WHERE id_proveedor = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createProveedor = async (data) => {
  const { identificacion_fiscal, nombre, contacto, telefono, correo_comercial, direccion } = data;
  const query = `
    INSERT INTO proveedores (identificacion_fiscal, nombre, contacto, telefono, correo_comercial, direccion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    identificacion_fiscal,
    nombre,
    contacto,
    telefono,
    correo_comercial,
    direccion ?? null
  ]);
  return { id_proveedor: result.insertId, ...data };
};

const updateProveedor = async (id, data) => {
  const { identificacion_fiscal, nombre, contacto, telefono, correo_comercial, direccion } = data;
  const query = `
    UPDATE proveedores
    SET identificacion_fiscal = ?, nombre = ?, contacto = ?, telefono = ?, correo_comercial = ?, direccion = ?
    WHERE id_proveedor = ?
  `;
  const [result] = await pool.execute(query, [
    identificacion_fiscal,
    nombre,
    contacto,
    telefono,
    correo_comercial,
    direccion ?? null,
    id
  ]);
  return result.affectedRows;
};

const deleteProveedor = async (id) => {
  const query = `DELETE FROM proveedores WHERE id_proveedor = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
};

