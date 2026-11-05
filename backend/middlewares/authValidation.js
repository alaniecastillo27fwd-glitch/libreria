const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const validarRegistro = (req, res, next) => {
  const { nombre, correo, password } = req.body || {};
  const errores = [];

  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    errores.push("El campo 'nombre' es obligatorio y debe contener al menos 2 caracteres.");
  }

  if (!correo || typeof correo !== "string" || !EMAIL_REGEX.test(correo.trim())) {
    errores.push("El campo 'correo' es obligatorio y debe tener un formato de email válido.");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    errores.push("El campo 'password' es obligatorio y debe tener un mínimo de 8 caracteres.");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos de registro inválidos",
      detalles: errores,
    });
  }

  req.body.nombre = nombre.trim();
  req.body.correo = correo.trim().toLowerCase();

  return next();
};

const validarLogin = (req, res, next) => {
  const { correo, password } = req.body || {};

  // En login, cualquier credencial ausente o con formato inválido responde 401 genérico
  // para cumplir estrictamente el contrato HTTP (200 | 401) sin filtrar información.
  if (
    !correo ||
    typeof correo !== "string" ||
    !EMAIL_REGEX.test(correo.trim()) ||
    !password ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return res.status(401).json({
      error: "Credenciales incorrectas",
    });
  }

  req.body.correo = correo.trim().toLowerCase();

  return next();
};

module.exports = {
  validarRegistro,
  validarLogin,
};
