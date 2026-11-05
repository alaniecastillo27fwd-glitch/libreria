# Sistema Empresarial de Inventario Mayorista ArtSupply Pro — Día 2 (Autenticación JWT + CRUDs Relacionales)

## 1. Descripción del Sistema Empresarial

**ArtSupply Pro** es una plataforma empresarial diseñada para la gestión integral de inventario mayorista de insumos para bellas artes y diseño técnico (pigmentos puros, óleos profesionales, lienzos de lino belga, pinceles Kolinsky y papeles de algodón de gramaje controlado).

En la entrega del **Día 2**, el sistema incorpora una arquitectura de seguridad **stateless basada en JSON Web Tokens (JWT)** y cifrado irreversible de contraseñas mediante **bcrypt** ($10$ *salt rounds*), protegiendo la totalidad de los **5 endpoints REST** de las entidades de negocio (`Productos`, `Categorías`, `Proveedores` y demás catálogos relacionales) detrás del middleware de autorización (`authMiddleware.js`) y vistas protegidas en **React (Vite)**.

---

## 2. Requisitos Previos

Antes de instalar y ejecutar el proyecto, asegúrate de contar con las siguientes herramientas en tu entorno local:
- **Node.js:** versión `18.x` LTS o superior (`node -v`).
- **Gestor de paquetes npm:** versión `9.x` o superior (`npm -v`).
- **MySQL Server:** versión `8.0` o superior activo en el puerto `3306`.
- **Postman** o extensión **Thunder Client** (VS Code) para ejecutar la colección de pruebas automatizadas (`ArtSupply_Pro_Dia2.postman_collection.json`).

---

## 3. Estructura de Carpetas del Proyecto (Día 2)

```text
libreria/
├── README.md
├── .gitignore
├── docs/
│   ├── INFORME_INVESTIGACION_JWT.md
│   ├── ArtSupply_Pro_Dia2.postman_collection.json
│   ├── Diagrama_ER_ArtSupply_Pro.drawio
│   ├── artsupply_db.sql
│   └── Pasos de Realizacion.txt
├── backend/
│   ├── .env.example                 [Plantilla de variables sin credenciales reales]
│   ├── .sequelizerc
│   ├── package.json
│   ├── app.js                       [Servidor Express en puerto 3000]
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   ├── migrations/
│   │   └── 20261104000001-create-tablas-artsupply.js
│   ├── models/
│   │   ├── index.js
│   │   ├── artsupply_db.sql         [DDL SQL completo con 11 tablas + Usuarios]
│   │   ├── usuarioModel.js          [NUEVO - Día 2: Entidad Usuario con bcrypt + toJSON()]
│   │   ├── categoriaModel.js        [Relación 1:N con Productos (ON DELETE RESTRICT)]
│   │   ├── proveedorModel.js        [Relación 1:N con Órdenes (ON DELETE RESTRICT)]
│   │   ├── productoModel.js         [FKs a Categoría, Marca y Unidad]
│   │   ├── ordenCompraModel.js      [FKs a Proveedor, Producto, Almacén y Usuario]
│   │   ├── marcaModel.js
│   │   ├── unidadMedidaModel.js
│   │   ├── almacenModel.js
│   │   ├── inventarioAlmacenModel.js
│   │   ├── movimientoStockModel.js
│   │   └── tipoMovimientoModel.js
│   ├── controllers/
│   │   ├── authController.js        [NUEVO - Día 2: register, login, me]
│   │   ├── categoriaController.js   [5 endpoints CRUD + bloqueo 409]
│   │   ├── proveedorController.js   [5 endpoints CRUD + bloqueo 409]
│   │   └── productoController.js    [5 endpoints CRUD + validación FK + bloqueo 409]
│   ├── middlewares/
│   │   ├── authMiddleware.js        [NUEVO - Día 2: Verificación Bearer JWT]
│   │   └── authValidation.js        [NUEVO - Día 2: Validación de entrada Auth]
│   ├── routes/
│   │   ├── authRoutes.js            [POST /register, POST /login, GET /me]
│   │   ├── categoriaRoutes.js       [5 rutas protegidas con authMiddleware]
│   │   ├── proveedorRoutes.js       [5 rutas protegidas con authMiddleware]
│   │   └── productoRoutes.js        [5 rutas protegidas con authMiddleware]
│   └── services/
│       └── productoService.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/
        │   ├── RutaProtegida.jsx    [NUEVO - Día 2: Guardián de rutas privadas]
        │   ├── ProductoForm.jsx
        │   └── ProductoTable.jsx
        ├── context/
        │   └── AuthContext.jsx      [NUEVO - Día 2: Estado global JWT + /auth/me]
        ├── pages/
        │   ├── Login.jsx            [NUEVO - Día 2: Inicio de sesión + alerta 401]
        │   ├── Registro.jsx         [NUEVO - Día 2: Alta de usuario + alerta 400]
        │   ├── ProductosPage.jsx    [CRUD Productos + <select> Categorías + Confirmación]
        │   ├── CategoriasPage.jsx   [CRUD Categorías + Confirmación + 409]
        │   └── ProveedoresPage.jsx  [CRUD Proveedores + Confirmación + 409]
        ├── routes/
        │   └── AppRouter.jsx        [Rutas públicas y privadas con <RutaProtegida>]
        ├── services/
        │   ├── api.js               [NUEVO - Día 2: Cliente HTTP con interceptores]
        │   └── productoService.js
        ├── app.jsx
        └── main.jsx
```

---

## 4. Configuración e Instalación Paso a Paso

### Paso 1: Preparar la Base de Datos MySQL 8.0
1. Inicia tu servicio local de MySQL 8.0 en el puerto `3306`.
2. Ejecuta el script DDL incluido para crear la base de datos `artsupply_db`, las 11 tablas (incluyendo `usuarios`) y la semilla inicial, o deja que Sequelize sincronice y siembre automáticamente los datos al arrancar el backend:
   ```bash
   mysql -u root -p < backend/models/artsupply_db.sql
   ```

### Paso 2: Configurar e Instalar el Backend y Variables de Entorno (`.env`)
1. Abre una terminal y sitúate en el directorio del backend:
   ```bash
   cd backend
   npm install
   ```
2. Crea tu archivo `.env` copiando la plantilla `.env.example` (el archivo `.env` está ignorado en `.gitignore`):
   ```bash
   cp .env.example .env
   ```
3. Genera una clave secreta criptográfica para `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. Configura tus variables en `backend/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=<TU_PASSWORD_MYSQL>
   DB_NAME=artsupply_db
   JWT_SECRET=<PEGA_AQUI_TU_CLAVE_HEXADECIMAL_GENERADA>
   JWT_EXPIRES_IN=8h
   ```

### Paso 3: Configurar e Instalar el Frontend (React + Vite)
1. Abre una segunda terminal y sitúate en la carpeta `frontend`:
   ```bash
   cd frontend
   npm install
   ```

---

## 5. Comandos para Ejecutar Ambos Entornos

### 1. Levantar el Servidor Backend (Puerto `3000`)
```bash
cd backend
npm run dev
# O bien: npm start
```
El servidor Express se conectará a MySQL y escuchará en `http://localhost:3000/api`.

### 2. Levantar el Cliente Frontend en React (Puerto `5173`)
```bash
cd frontend
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## 6. Resumen de Endpoints de la API (Día 2)

### 6.1. Endpoints de Autenticación (`/api/auth`)
| Operación | Método | Ruta | Protección | Respuestas Esperadas |
| :--- | :---: | :--- | :---: | :--- |
| **Registro de usuario** | `POST` | `/api/auth/register` | Pública | `201 Created` (usuario sin `password`) \| `400 Bad Request` (correo duplicado o validación fallida) |
| **Inicio de sesión** | `POST` | `/api/auth/login` | Pública | `200 OK` (`{ token, usuario }`) \| `401 Unauthorized` (`{ error: "Credenciales incorrectas" }`) |
| **Perfil actual** | `GET` | `/api/auth/me` | **Bearer JWT** | `200 OK` (usuario del token sin `password`) \| `401 Unauthorized` (sin token o token vencido) |

### 6.2. Endpoints CRUD de las Entidades de Negocio (`/api/productos`, `/api/categorias`, `/api/proveedores`)
Todas las rutas siguientes exigen el encabezado `Authorization: Bearer <token>`:
| Operación | Método | Ruta | Respuestas Esperadas |
| :--- | :---: | :--- | :--- |
| **Listar registros** | `GET` | `/api/:entidad` | `200 OK` (arreglo con relaciones incluidas) \| `401 Unauthorized` |
| **Ver detalle** | `GET` | `/api/:entidad/:id` | `200 OK` \| `404 Not Found` \| `401 Unauthorized` |
| **Crear registro** | `POST` | `/api/:entidad` | `201 Created` \| `400 Bad Request` (datos inválidos o FK inexistente) \| `401 Unauthorized` |
| **Actualizar registro** | `PUT` | `/api/:entidad/:id` | `200 OK` \| `400 Bad Request` \| `404 Not Found` \| `401 Unauthorized` |
| **Eliminar registro** | `DELETE` | `/api/:entidad/:id` | `200 OK` \| `404 Not Found` \| `409 Conflict` (dependencias activas) \| `401 Unauthorized` |

---

## 7. Instrucciones para Importar y Ejecutar la Colección de Pruebas (Postman / Thunder Client)

1. Abre **Postman** o **Thunder Client** en Visual Studio Code.
2. Haz clic en **Import** y selecciona el archivo `ArtSupply_Pro_Dia2.postman_collection.json` ubicado en la raíz del proyecto.
3. Verifica que la variable de colección `base_url` tenga el valor `http://localhost:3000/api`.
4. Ejecuta las **4 carpetas (39 peticiones)** en orden secuencial o mediante el **Collection Runner**:
   - **Carpeta 1 (`1. Autenticación`):** Prueba registro exitoso (`201`), correo duplicado (`400`), contraseña corta (`400`), login exitoso (`200` con guardado automático de `{{jwt_token}}`), login inválido (`401`) y `/api/auth/me` con y sin token (`200` y `401`).
   - **Carpeta 2 (`2. CRUD Productos`):** Verifica bloqueo sin token (`401`), listado con `categoria_nombre` (`200`), creación válida (`201`), FK inexistente (`400`), detalle (`200`/`404`), actualización (`200`/`400`/`404`) y eliminación con y sin dependencias (`409`/`404`/`200`).
   - **Carpeta 3 (`3. CRUD Categorías`):** Prueba los 5 endpoints REST y el bloqueo `409 Conflict` al intentar eliminar una categoría con productos vinculados.
   - **Carpeta 4 (`4. CRUD Proveedores`):** Prueba los 5 endpoints REST y el bloqueo `409 Conflict` al intentar eliminar un proveedor con órdenes de compra asociadas.
