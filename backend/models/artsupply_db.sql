DROP DATABASE IF EXISTS artsupply_db;
CREATE DATABASE artsupply_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE artsupply_db;

-- 0. usuarios (Entidad de Autenticación - Día 2)
CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt (60 caracteres) generado desde contraseña >= 8 caracteres',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_correo UNIQUE (correo),
    CONSTRAINT chk_usuarios_correo_formato CHECK (correo REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuarios_password_hash CHECK (CHAR_LENGTH(password) >= 60)
) ENGINE=InnoDB;

-- 1. categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_categorias PRIMARY KEY (id_categoria),
    CONSTRAINT uq_categorias_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- 2. marcas
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(80) NOT NULL,
    descripcion TEXT NULL,
    CONSTRAINT pk_marcas PRIMARY KEY (id_marca),
    CONSTRAINT uq_marcas_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- 3. unidades_medida
CREATE TABLE unidades_medida (
    id_unidad INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(20) NOT NULL,
    CONSTRAINT pk_unidades_medida PRIMARY KEY (id_unidad),
    CONSTRAINT uq_unidades_medida_nombre UNIQUE (nombre),
    CONSTRAINT uq_unidades_medida_abreviatura UNIQUE (abreviatura)
) ENGINE=InnoDB;

-- 4. almacenes
CREATE TABLE almacenes (
    id_almacen INT AUTO_INCREMENT,
    codigo_almacen VARCHAR(30) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    tipo_ambiente ENUM('ESTANDAR', 'CLIMATIZADO', 'SECO_CONTROLADO') NOT NULL DEFAULT 'ESTANDAR',
    CONSTRAINT pk_almacenes PRIMARY KEY (id_almacen),
    CONSTRAINT uq_almacenes_codigo UNIQUE (codigo_almacen),
    CONSTRAINT uq_almacenes_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- 5. proveedores
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT,
    identificacion_fiscal VARCHAR(30) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    correo_comercial VARCHAR(120) NOT NULL,
    direccion TEXT NULL,
    CONSTRAINT pk_proveedores PRIMARY KEY (id_proveedor),
    CONSTRAINT uq_proveedores_fiscal UNIQUE (identificacion_fiscal),
    CONSTRAINT uq_proveedores_correo UNIQUE (correo_comercial)
) ENGINE=InnoDB;

-- 6. tipos_movimiento
CREATE TABLE tipos_movimiento (
    id_tipo_movimiento INT AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    naturaleza ENUM('ENTRADA', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO') NOT NULL,
    descripcion TEXT NULL,
    CONSTRAINT pk_tipos_movimiento PRIMARY KEY (id_tipo_movimiento),
    CONSTRAINT uq_tipos_movimiento_codigo UNIQUE (codigo),
    CONSTRAINT uq_tipos_movimiento_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- 7. productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT,
    codigo_sku VARCHAR(50) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_minimo INT NOT NULL DEFAULT 0,
    id_categoria INT NOT NULL,
    id_marca INT NOT NULL,
    id_unidad INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_productos PRIMARY KEY (id_producto),
    CONSTRAINT uq_productos_codigo_sku UNIQUE (codigo_sku),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_productos_marca
        FOREIGN KEY (id_marca) REFERENCES marcas (id_marca)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_productos_unidad
        FOREIGN KEY (id_unidad) REFERENCES unidades_medida (id_unidad)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. inventario_almacen
CREATE TABLE inventario_almacen (
    id_inventario_almacen INT AUTO_INCREMENT,
    producto_id INT NOT NULL,
    almacen_id INT NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 10,
    stock_maximo INT NOT NULL DEFAULT 500,
    pasillo_estante VARCHAR(50) NOT NULL,
    ultima_conciliacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventario_almacen PRIMARY KEY (id_inventario_almacen),
    CONSTRAINT uq_inventario_producto_almacen UNIQUE (producto_id, almacen_id),
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inventario_almacen
        FOREIGN KEY (almacen_id) REFERENCES almacenes (id_almacen)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. movimientos_stock
CREATE TABLE movimientos_stock (
    id_movimiento_stock INT AUTO_INCREMENT,
    folio_movimiento VARCHAR(40) NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT NULL,
    producto_id INT NOT NULL,
    almacen_id INT NOT NULL,
    tipo_movimiento_id INT NOT NULL,
    CONSTRAINT pk_movimientos_stock PRIMARY KEY (id_movimiento_stock),
    CONSTRAINT uq_movimientos_folio UNIQUE (folio_movimiento),
    CONSTRAINT fk_movimientos_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_movimientos_almacen
        FOREIGN KEY (almacen_id) REFERENCES almacenes (id_almacen)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_movimientos_tipo
        FOREIGN KEY (tipo_movimiento_id) REFERENCES tipos_movimiento (id_tipo_movimiento)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. ordenes_compra
CREATE TABLE ordenes_compra (
    id_orden_compra INT AUTO_INCREMENT,
    numero_orden VARCHAR(40) NOT NULL,
    cantidad_solicitada INT NOT NULL,
    precio_unitario_pactado DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion_estimada DATETIME NULL,
    estado ENUM('PENDIENTE', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT NULL,
    proveedor_id INT NOT NULL,
    producto_id INT NOT NULL,
    almacen_destino_id INT NOT NULL,
    usuario_id INT UNSIGNED NULL,
    CONSTRAINT pk_ordenes_compra PRIMARY KEY (id_orden_compra),
    CONSTRAINT uq_ordenes_numero_orden UNIQUE (numero_orden),
    CONSTRAINT fk_ordenes_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedores (id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ordenes_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ordenes_almacen_destino
        FOREIGN KEY (almacen_destino_id) REFERENCES almacenes (id_almacen)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ordenes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- INSERTS SEMILLA
INSERT INTO categorias (nombre, descripcion) VALUES
('Pigmentos y Óleos Profesionales', 'Pinturas al óleo extrafinas, pigmentos puros en polvo y medios alquídicos de secado controlado.'),
('Lienzos y Soportes Rígidos', 'Bastidores entelados en lino belga, algodón de alto gramaje y paneles de madera imprimados con gesso.'),
('Pinceles y Espátulas Técnicas', 'Herramientas de aplicación de pelo natural Kolinsky, cerda blanca Chungking, fibras sintéticas y acero templado.'),
('Papeles Técnicos y Acuarela', 'Papeles 100% algodón prensados en frío, caliente y grano grueso libres de ácido para técnicas húmedas y grabado.');

INSERT INTO marcas (nombre, pais_origen, descripcion) VALUES
('Winsor & Newton', 'Reino Unido', 'Fabricante histórico de acuarelas profesionales, óleos de grado artístico y solventes refinados.'),
('Fabriano', 'Italia', 'Casa papelera especializada en pliegos y blocks de algodón de alta resistencia para acuarela, dibujo técnico y grabado.'),
('Escoda', 'España', 'Fabricante artesanal de pinceles finos de pelo natural y fibras sintéticas de alta retención de carga.'),
('Sennelier', 'Francia', 'Productor de pigmentos puros, pasteles suaves extrafinos y óleos de formulación tradicional.');

INSERT INTO unidades_medida (nombre, abreviatura) VALUES
('Tubo de 37 Mililitros', 'TUB-37ML'),
('Pliego 56x76 Centímetros', 'PLG-56X76'),
('Caja Mayorista de 12 Unidades', 'CAJ-12U'),
('Rollo de 10 Metros Lineales', 'ROL-10M');
