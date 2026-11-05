const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const categoriaController = require("../controllers/categoriaController");

router.use(authMiddleware);

router.get("/", categoriaController.obtenerCategorias);
router.get("/:id", categoriaController.obtenerCategoriaPorId);
router.post("/", categoriaController.crearCategoria);
router.put("/:id", categoriaController.actualizarCategoria);
router.delete("/:id", categoriaController.eliminarCategoria);

module.exports = router;

