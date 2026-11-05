const productoModel = require('../models/productoModel');

const obtenerTodosLosProductos = async () => {
  return await productoModel.getAllProductos();
};

const obtenerProductoPorId = async (id) => {
  return await productoModel.getProductoById(id);
};

const crearNuevoProducto = async (data) => {
  return await productoModel.createProducto(data);
};

const actualizarProductoExistente = async (id, data) => {
  return await productoModel.updateProducto(id, data);
};

const eliminarProductoPorId = async (id) => {
  return await productoModel.deleteProducto(id);
};

module.exports = {
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  crearNuevoProducto,
  actualizarProductoExistente,
  eliminarProductoPorId
};

