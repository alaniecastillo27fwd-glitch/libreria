const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  obtenerProductos,
  obtenerProductoPorId,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");

// Todas las rutas de Producto están protegidas por el middleware JWT (responde 401 si no hay token válido)
router.use(authMiddleware);

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", agregarProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
