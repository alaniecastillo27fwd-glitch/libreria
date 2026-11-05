const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const proveedorController = require("../controllers/proveedorController");

// Proteger los 5 endpoints REST de Proveedores con el middleware JWT
router.use(authMiddleware);

router.get("/", proveedorController.obtenerProveedores);
router.get("/:id", proveedorController.obtenerProveedorPorId);
router.post("/", proveedorController.crearProveedor);
router.put("/:id", proveedorController.actualizarProveedor);
router.delete("/:id", proveedorController.eliminarProveedor);

module.exports = router;

