const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validarRegistro, validarLogin } = require("../middlewares/authValidation");

// Rutas públicas de autenticación
router.post("/register", validarRegistro, authController.register);
router.post("/login", validarLogin, authController.login);

// Ruta protegida para obtener el perfil del usuario autenticado
router.get("/me", authMiddleware, authController.me);

module.exports = router;

