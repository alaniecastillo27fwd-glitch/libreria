const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticación JWT para proteger rutas de negocio.
 * Inspecciona el encabezado 'Authorization: Bearer <token>', verifica la firma
 * y vigencia del JWT, e inyecta el payload decodificado en req.user (y req.usuario).
 */
const authMiddleware = (req, res, next) => {
  // 1. Inspeccionar la existencia del encabezado Authorization
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({
      error: "No autorizado",
      detalle: "El encabezado Authorization es obligatorio",
    });
  }

  // 2. Validar que inicie estrictamente con 'Bearer ' y extraer el token sin espacios residuales
  const headerLimpio = authHeader.trim();
  if (!headerLimpio.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No autorizado",
      detalle: "Formato de autorización inválido. Se esperaba: 'Bearer <token>'",
    });
  }

  const token = headerLimpio.slice(7).trim();

  // Rechazar si el token está vacío ("Bearer ") o contiene espacios internos ("Bearer a b")
  if (!token || /\s/.test(token)) {
    return res.status(401).json({
      error: "No autorizado",
      detalle: "El token Bearer está vacío o tiene un formato malformado",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: "Error de configuración del servidor: falta JWT_SECRET",
    });
  }

  let decodedPayload;

  // 3. Bloque try/catch acotado exclusivamente a la verificación criptográfica del JWT
  // (Evita capturar por error excepciones síncronas lanzadas por controladores aguas abajo en next())
  try {
    decodedPayload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    // Manejador diferenciado para Token Expirado (debe evaluarse ANTES que JsonWebTokenError)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "No autorizado",
        codigo: "TOKEN_EXPIRED",
        detalle: "El token ha expirado. Por favor, inicie sesión nuevamente",
        expiradoEn: error.expiredAt,
      });
    }

    // Manejador diferenciado para Firma Inválida o Token Malformado
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "No autorizado",
        codigo: "INVALID_TOKEN",
        detalle: "El token proporcionado es inválido o su firma fue alterada",
      });
    }

    // Manejador para NotBeforeError u cualquier otra excepción de verificación
    return res.status(401).json({
      error: "No autorizado",
      codigo: "AUTH_ERROR",
      detalle: "No fue posible verificar la autenticidad del token",
    });
  }

  // 4. Verificar que el payload decodificado contenga la identidad mínima requerida
  if (!decodedPayload || typeof decodedPayload !== "object" || !decodedPayload.id) {
    return res.status(401).json({
      error: "No autorizado",
      codigo: "INVALID_PAYLOAD",
      detalle: "El payload del token no contiene un identificador de usuario válido",
    });
  }

  // 5. Adjuntar identidad decodificada en req.user (y alias req.usuario) e invocar next() fuera del try
  const userContext = {
    id: decodedPayload.id,
    nombre: decodedPayload.nombre,
    correo: decodedPayload.correo,
  };

  req.user = userContext;
  req.usuario = userContext;

  return next();
};

module.exports = authMiddleware;
