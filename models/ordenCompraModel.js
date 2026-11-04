const pool = require('../config/db');

const getAllOrdenesCompra = async () => {
  const query = `
    SELECT
      oc.id_orden_compra,
      oc.numero_orden,
      oc.cantidad_solicitada,
      oc.precio_unitario_pactado,
      oc.monto_total,
      oc.fecha_pedido,
      oc.fecha_recepcion_estimada,
      oc.estado,
      oc.observaciones,
      oc.proveedor_id,
      oc.producto_id,
      oc.almacen_destino_id,
      pr.nombre AS proveedor_nombre,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_destino_nombre
    FROM ordenes_compra oc
    INNER JOIN proveedores pr ON oc.proveedor_id = pr.id_proveedor
    INNER JOIN productos p ON oc.producto_id = p.id_producto
    INNER JOIN almacenes a ON oc.almacen_destino_id = a.id_almacen
    ORDER BY oc.id_orden_compra DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

const getOrdenCompraById = async (id) => {
  const query = `
    SELECT
      oc.id_orden_compra,
      oc.numero_orden,
      oc.cantidad_solicitada,
      oc.precio_unitario_pactado,
      oc.monto_total,
      oc.fecha_pedido,
      oc.fecha_recepcion_estimada,
      oc.estado,
      oc.observaciones,
      oc.proveedor_id,
      oc.producto_id,
      oc.almacen_destino_id,
      pr.nombre AS proveedor_nombre,
      p.codigo_sku,
      p.nombre AS producto_nombre,
      a.nombre AS almacen_destino_nombre
    FROM ordenes_compra oc
    INNER JOIN proveedores pr ON oc.proveedor_id = pr.id_proveedor
    INNER JOIN productos p ON oc.producto_id = p.id_producto
    INNER JOIN almacenes a ON oc.almacen_destino_id = a.id_almacen
    WHERE oc.id_orden_compra = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const createOrdenCompra = async (data) => {
  const {
    numero_orden,
    cantidad_solicitada,
    precio_unitario_pactado,
    monto_total,
    fecha_recepcion_estimada,
    estado,
    observaciones,
    proveedor_id,
    producto_id,
    almacen_destino_id
  } = data;

  const query = `
    INSERT INTO ordenes_compra (
      numero_orden,
      cantidad_solicitada,
      precio_unitario_pactado,
      monto_total,
      fecha_recepcion_estimada,
      estado,
      observaciones,
      proveedor_id,
      producto_id,
      almacen_destino_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    numero_orden,
    cantidad_solicitada,
    precio_unitario_pactado,
    monto_total,
    fecha_recepcion_estimada ?? null,
    estado || 'PENDIENTE',
    observaciones ?? null,
    proveedor_id,
    producto_id,
    almacen_destino_id
  ]);
  return { id_orden_compra: result.insertId, ...data };
};

const updateOrdenCompra = async (id, data) => {
  const {
    numero_orden,
    cantidad_solicitada,
    precio_unitario_pactado,
    monto_total,
    fecha_recepcion_estimada,
    estado,
    observaciones,
    proveedor_id,
    producto_id,
    almacen_destino_id
  } = data;

  const query = `
    UPDATE ordenes_compra
    SET
      numero_orden = ?,
      cantidad_solicitada = ?,
      precio_unitario_pactado = ?,
      monto_total = ?,
      fecha_recepcion_estimada = ?,
      estado = ?,
      observaciones = ?,
      proveedor_id = ?,
      producto_id = ?,
      almacen_destino_id = ?
    WHERE id_orden_compra = ?
  `;
  const [result] = await pool.execute(query, [
    numero_orden,
    cantidad_solicitada,
    precio_unitario_pactado,
    monto_total,
    fecha_recepcion_estimada ?? null,
    estado || 'PENDIENTE',
    observaciones ?? null,
    proveedor_id,
    producto_id,
    almacen_destino_id,
    id
  ]);
  return result.affectedRows;
};

const deleteOrdenCompra = async (id) => {
  const query = `DELETE FROM ordenes_compra WHERE id_orden_compra = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllOrdenesCompra,
  getOrdenCompraById,
  createOrdenCompra,
  updateOrdenCompra,
  deleteOrdenCompra
};

