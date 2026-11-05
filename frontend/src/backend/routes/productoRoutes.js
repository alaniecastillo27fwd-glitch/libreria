const express = require("express");
const router = express.Router();

const {
  agregarProducto,
  eliminarProducto,
  actualizarProducto,
  obtenerProductos,
  obtenerProductoPorId
} = require("../controllers/productoController");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", agregarProducto);
router.put("/:id", actualizarProducto);
router.patch("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
