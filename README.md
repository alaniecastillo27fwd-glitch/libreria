# Sistema Empresarial de Inventario ArtSupply Pro

## 1. Justificación del Negocio

En el sector de la distribución mayorista de insumos para bellas artes y diseño técnico, **ArtSupply Pro** gestiona un catálogo especializado compuesto por pigmentos puros, óleos profesionales, lienzos de lino y algodón, pinceles de pelo natural y papeles de gramaje controlado. La administración manual o desarticulada de este inventario provoca desabastecimientos críticos en referencias de alta rotación comercial y discrepancias recurrentes entre las existencias físicas en bodega y los saldos contables lógicos, afectando los tiempos de reposición con proveedores internacionales y generando pérdidas operativas.

Este sistema empresarial resuelve dicha problemática mediante un modelo relacional normalizado en **MySQL 8.0** de 10 entidades interconectadas, un backend API RESTful en **Node.js + Express + Sequelize** y un cliente reactivo en **React (Vite)**. La arquitectura está enfocada 100% en la trazabilidad transaccional y las operaciones CRUD completas (Crear, Leer, Actualizar y Eliminar) con validaciones defensivas de integridad, prescindiendo deliberadamente de capas de autenticación, login, roles o tokens según los lineamientos técnicos del proyecto.

---

## 2. Modelo de Datos (10 Entidades Principales)

| # | Entidad | Clave Primaria (PK) | Atributos Clave y Claves Foráneas (FK) |
| :--- | :--- | :--- | :--- |
| 1 | `categorias` | `id_categoria` | `nombre` (UNIQUE), `descripcion`, `fecha_creacion` |
| 2 | `marcas` | `id_marca` | `nombre` (UNIQUE), `pais_origen`, `descripcion` |
| 3 | `unidades_medida` | `id_unidad` | `nombre` (UNIQUE), `abreviatura` (UNIQUE) |
| 4 | `almacenes` | `id_almacen` | `codigo_almacen` (UNIQUE), `nombre`, `ubicacion`, `tipo_ambiente` (ENUM) |
| 5 | `proveedores` | `id_proveedor` | `identificacion_fiscal` (UNIQUE), `nombre`, `contacto`, `telefono`, `correo_comercial` |
| 6 | `tipos_movimiento` | `id_tipo_movimiento` | `codigo` (UNIQUE), `nombre`, `naturaleza` (ENUM), `descripcion` |
| 7 | `productos` | `id_producto` | `codigo_sku` (UNIQUE), `nombre`, `descripcion`, `precio_compra`, `precio_venta`, `stock_minimo`, `id_categoria` (FK), `id_marca` (FK), `id_unidad` (FK) |
| 8 | `inventario_almacen` | `id_inventario_almacen` | `producto_id` (FK), `almacen_id` (FK), `stock_actual`, `stock_minimo`, `stock_maximo`, `pasillo_estante` |
| 9 | `movimientos_stock` | `id_movimiento_stock` | `folio_movimiento` (UNIQUE), `cantidad`, `costo_unitario`, `fecha`, `producto_id` (FK), `almacen_id` (FK), `tipo_movimiento_id` (FK) |
| 10 | `ordenes_compra` | `id_orden_compra` | `numero_orden` (UNIQUE), `cantidad_solicitada`, `precio_unitario_pactado`, `monto_total`, `fecha_pedido`, `estado` (ENUM), `proveedor_id` (FK), `producto_id` (FK), `almacen_destino_id` (FK) |

---

## 3. Documentación de Endpoints REST (`/api/productos`)

| Operación | Método HTTP | Ruta | Códigos de Estado | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Listar todos** | `GET` | `/api/productos` | `200 OK`, `500 Internal Server Error` | Retorna el arreglo de productos con `categoria_nombre`, `marca_nombre` y `unidad_abreviatura`. |
| **Consultar por ID** | `GET` | `/api/productos/:id` | `200 OK`, `400 Bad Request`, `404 Not Found` | Retorna el detalle de un producto específico o `404` si no existe. |
| **Crear producto** | `POST` | `/api/productos` | `201 Created`, `400 Bad Request`, `500 Internal Server Error` | Valida tipos y obligatoriedad, inserta el producto y retorna el objeto creado con su `id_producto`. |
| **Actualizar producto** | `PUT` | `/api/productos/:id` | `200 OK`, `400 Bad Request`, `404 Not Found` | Actualiza un registro existente tras validar el payload o retorna `404` si el ID no existe. |
| **Eliminar producto** | `DELETE` | `/api/productos/:id` | `200 OK`, `400 Bad Request`, `404 Not Found` | Elimina físicamente el producto por ID y confirma la operación. |
