const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const DUMMY_BCRYPT_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8D0R6V5p4K1a7Y9z2X3c4V5b6N7m8O";

const sanitizarUsuario = (usuario) => ({
  id: usuario.id,
  id_usuario: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  telefono: usuario.telefono,
  id_rol_usuario: usuario.id_rol_usuario,
  es_miembro: usuario.es_miembro,
  fechaCreacion: usuario.fechaCreacion,
});

// 1. POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, telefono } = req.body || {};

    const errores = [];

    if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
      errores.push("El nombre es obligatorio y debe tener al menos 2 caracteres.");
    }

    if (!correo || typeof correo !== "string" || !EMAIL_REGEX.test(correo.trim())) {
      errores.push("Debe proporcionar un correo electrónico con formato válido.");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      errores.push(
        "La contraseña es obligatoria y debe tener al menos 8 caracteres en texto plano."
      );
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: "Error de validación en el registro",
        detalles: errores,
      });
    }

    const nombreNormalizado = nombre.trim().slice(0, 50);
    const correoNormalizado = correo.trim().toLowerCase().slice(0, 50);

    const usuarioExistente = await Usuario.findOne({
      where: { correo: correoNormalizado },
      attributes: ["id"],
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: "El correo electrónico ya se encuentra registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const nuevoUsuario = await Usuario.create({
      nombre: nombreNormalizado,
      correo: correoNormalizado,
      telefono: Number(telefono) || 88810099,
      id_rol_usuario: 1,
      es_miembro: 1,
      password: passwordHash,
    });

    return res.status(201).json(sanitizarUsuario(nuevoUsuario));
  } catch (error) {
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        error: "El correo electrónico ya se encuentra registrado",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Error de validación en los datos del usuario",
        detalles: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      error: "Error interno del servidor al registrar el usuario",
    });
  }
};

// 2. POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body || {};

    if (
      !correo ||
      typeof correo !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        error:
          "Error de configuración del servidor: falta variable de entorno JWT_SECRET",
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = await Usuario.findOne({
      where: { correo: correoNormalizado },
    });

    const hashObjetivo =
      usuario && usuario.password ? usuario.password : DUMMY_BCRYPT_HASH;
    const passwordValido = await bcrypt.compare(password, hashObjetivo);

    if (!usuario || !passwordValido) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      algorithm: "HS256",
    });

    return res.status(200).json({
      token,
      usuario: sanitizarUsuario(usuario),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor al procesar el inicio de sesión",
    });
  }
};

// 3. GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const userId = req.user?.id || req.usuario?.id;
    const userCorreo = req.user?.correo || req.usuario?.correo;

    if (!userId && !userCorreo) {
      return res.status(401).json({
        error: "No autorizado",
      });
    }

    let usuario = null;
    if (userCorreo) {
      usuario = await Usuario.findOne({
        where: { correo: userCorreo },
        attributes: { exclude: ["password"] },
      });
    }
    if (!usuario && userId) {
      usuario = await Usuario.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
    }

    if (!usuario) {
      return res.status(401).json({
        error: "No autorizado: el usuario asociado al token ya no existe",
      });
    }

    return res.status(200).json(sanitizarUsuario(usuario));
  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor al obtener el perfil del usuario",
    });
  }
};
