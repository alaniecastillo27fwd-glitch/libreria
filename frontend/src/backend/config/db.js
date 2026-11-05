const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost =
  !process.env.DB_HOST || process.env.DB_HOST === 'libreria'
    ? 'localhost'
    : process.env.DB_HOST;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'artsupply_db';
const dbPort = Number(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const inicializarBaseDeDatos = async () => {
  try {
    // 1. Crear la base de datos si aún no existe
    const adminConn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConn.end();

    // 2. Verificar conexión desde el pool principal y crear las 10 tablas si no existen
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id_categoria INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS marcas (
        id_marca INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        pais_origen VARCHAR(80) NOT NULL DEFAULT 'Internacional',
        descripcion TEXT NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS unidades_medida (
        id_unidad INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        abreviatura VARCHAR(20) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS almacenes (
        id_almacen INT AUTO_INCREMENT PRIMARY KEY,
        codigo_almacen VARCHAR(30) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        ubicacion VARCHAR(150) NOT NULL,
        tipo_ambiente ENUM('ESTANDAR', 'CLIMATIZADO', 'SECO_CONTROLADO') NOT NULL DEFAULT 'ESTANDAR'
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
        identificacion_fiscal VARCHAR(30) NOT NULL UNIQUE,
        nombre VARCHAR(120) NOT NULL,
        contacto VARCHAR(100) NOT NULL,
        telefono VARCHAR(30) NOT NULL,
        correo_comercial VARCHAR(120) NOT NULL UNIQUE,
        direccion TEXT NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tipos_movimiento (
        id_tipo_movimiento INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        naturaleza ENUM('ENTRADA', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO') NOT NULL,
        descripcion TEXT NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id_producto INT AUTO_INCREMENT PRIMARY KEY,
        codigo_sku VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(120) NOT NULL,
        descripcion TEXT NULL,
        precio_compra DECIMAL(10,2) NOT NULL,
        precio_venta DECIMAL(10,2) NOT NULL,
        stock_minimo INT NOT NULL DEFAULT 0,
        id_categoria INT NOT NULL,
        id_marca INT NOT NULL,
        id_unidad INT NOT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_productos_marca FOREIGN KEY (id_marca) REFERENCES marcas (id_marca) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_productos_unidad FOREIGN KEY (id_unidad) REFERENCES unidades_medida (id_unidad) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventario_almacen (
        id_inventario_almacen INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        almacen_id INT NOT NULL,
        stock_actual INT NOT NULL DEFAULT 0,
        stock_minimo INT NOT NULL DEFAULT 10,
        stock_maximo INT NOT NULL DEFAULT 500,
        pasillo_estante VARCHAR(50) NOT NULL,
        ultima_conciliacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_inventario_producto_almacen (producto_id, almacen_id),
        CONSTRAINT fk_inventario_producto FOREIGN KEY (producto_id) REFERENCES productos (id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_inventario_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes (id_almacen) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS movimientos_stock (
        id_movimiento_stock INT AUTO_INCREMENT PRIMARY KEY,
        folio_movimiento VARCHAR(40) NOT NULL UNIQUE,
        cantidad INT NOT NULL,
        costo_unitario DECIMAL(10,2) NOT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        observaciones TEXT NULL,
        producto_id INT NOT NULL,
        almacen_id INT NOT NULL,
        tipo_movimiento_id INT NOT NULL,
        CONSTRAINT fk_movimientos_producto FOREIGN KEY (producto_id) REFERENCES productos (id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_movimientos_almacen FOREIGN KEY (almacen_id) REFERENCES almacenes (id_almacen) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_movimientos_tipo FOREIGN KEY (tipo_movimiento_id) REFERENCES tipos_movimiento (id_tipo_movimiento) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ordenes_compra (
        id_orden_compra INT AUTO_INCREMENT PRIMARY KEY,
        numero_orden VARCHAR(40) NOT NULL UNIQUE,
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
        CONSTRAINT fk_ordenes_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores (id_proveedor) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_ordenes_producto FOREIGN KEY (producto_id) REFERENCES productos (id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_ordenes_almacen_destino FOREIGN KEY (almacen_destino_id) REFERENCES almacenes (id_almacen) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 3. Insertar datos semilla iniciales si las tablas maestras están vacías
    await connection.query(`
      INSERT IGNORE INTO categorias (id_categoria, nombre, descripcion) VALUES
      (1, 'Pigmentos y Óleos Profesionales', 'Pinturas al óleo extrafinas, pigmentos puros en polvo y medios alquídicos.'),
      (2, 'Lienzos y Soportes Rígidos', 'Bastidores entelados en lino belga y algodón de alto gramaje.'),
      (3, 'Pinceles y Espátulas Técnicas', 'Herramientas de pelo natural Kolinsky, fibras sintéticas y acero templado.'),
      (4, 'Papeles Técnicos y Acuarela', 'Papeles 100% algodón prensados en frío, caliente y grano grueso.');
    `);

    await connection.query(`
      INSERT IGNORE INTO marcas (id_marca, nombre, pais_origen, descripcion) VALUES
      (1, 'Winsor & Newton', 'Reino Unido', 'Acuarelas profesionales, óleos de grado artístico y solventes.'),
      (2, 'Fabriano', 'Italia', 'Pliegos y blocks de algodón de alta resistencia para acuarela y grabado.'),
      (3, 'Escoda', 'España', 'Pinceles finos de pelo natural y fibras sintéticas.'),
      (4, 'Sennelier', 'Francia', 'Pigmentos puros, pasteles suaves extrafinos y óleos.');
    `);

    await connection.query(`
      INSERT IGNORE INTO unidades_medida (id_unidad, nombre, abreviatura) VALUES
      (1, 'Tubo de 37 Mililitros', 'TUB-37ML'),
      (2, 'Pliego 56x76 Centímetros', 'PLG-56X76'),
      (3, 'Caja Mayorista de 12 Unidades', 'CAJ-12U'),
      (4, 'Rollo de 10 Metros Lineales', 'ROL-10M');
    `);

    console.log(`✅ Conexión exitosa a MySQL (${dbName}). Tablas y semillas verificadas.`);
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar o inicializar la base de datos MySQL:', error.message);
  }
};

inicializarBaseDeDatos();

module.exports = pool;

