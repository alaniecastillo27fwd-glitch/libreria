const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productoController');

// Rutas base: /api/productos
router.get('/', getProductos);
router.get('/:id', getProducto);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;

