'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 0. usuarios (Día 2 - Autenticación)
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      correo: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 1. categorias
    await queryInterface.createTable('categorias', {
      id_categoria: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. marcas
    await queryInterface.createTable('marcas', {
      id_marca: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      pais_origen: { type: Sequelize.STRING(80), allowNull: false, defaultValue: 'Internacional' },
      descripcion: { type: Sequelize.TEXT, allowNull: true }
    });

    // 3. unidades_medida
    await queryInterface.createTable('unidades_medida', {
      id_unidad: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      abreviatura: { type: Sequelize.STRING(20), allowNull: false, unique: true }
    });

    // 4. almacenes
    await queryInterface.createTable('almacenes', {
      id_almacen: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo_almacen: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      ubicacion: { type: Sequelize.STRING(150), allowNull: false },
      tipo_ambiente: {
        type: Sequelize.ENUM('ESTANDAR', 'CLIMATIZADO', 'SECO_CONTROLADO'),
        allowNull: false,
        defaultValue: 'ESTANDAR'
      }
    });

    // 5. proveedores
    await queryInterface.createTable('proveedores', {
      id_proveedor: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      identificacion_fiscal: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      contacto: { type: Sequelize.STRING(100), allowNull: false },
      telefono: { type: Sequelize.STRING(30), allowNull: false },
      correo_comercial: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      direccion: { type: Sequelize.TEXT, allowNull: true }
    });

    // 6. tipos_movimiento
    await queryInterface.createTable('tipos_movimiento', {
      id_tipo_movimiento: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      naturaleza: {
        type: Sequelize.ENUM('ENTRADA', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'),
        allowNull: false
      },
      descripcion: { type: Sequelize.TEXT, allowNull: true }
    });

    // 7. productos
    await queryInterface.createTable('productos', {
      id_producto: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo_sku: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      precio_compra: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      precio_venta: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock_minimo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categorias', key: 'id_categoria' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_marca: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'marcas', key: 'id_marca' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_unidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades_medida', key: 'id_unidad' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha_registro: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 8. inventario_almacen
    await queryInterface.createTable('inventario_almacen', {
      id_inventario_almacen: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'productos', key: 'id_producto' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      almacen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'almacenes', key: 'id_almacen' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      stock_actual: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      stock_minimo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 10 },
      stock_maximo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 500 },
      pasillo_estante: { type: Sequelize.STRING(50), allowNull: false },
      ultima_conciliacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 9. movimientos_stock
    await queryInterface.createTable('movimientos_stock', {
      id_movimiento_stock: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      folio_movimiento: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      costo_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'productos', key: 'id_producto' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      almacen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'almacenes', key: 'id_almacen' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo_movimiento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tipos_movimiento', key: 'id_tipo_movimiento' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }
    });

    // 10. ordenes_compra
    await queryInterface.createTable('ordenes_compra', {
      id_orden_compra: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      numero_orden: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      cantidad_solicitada: { type: Sequelize.INTEGER, allowNull: false },
      precio_unitario_pactado: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      monto_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      fecha_pedido: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_recepcion_estimada: { type: Sequelize.DATE, allowNull: true },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'PENDIENTE'
      },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      proveedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'proveedores', key: 'id_proveedor' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'productos', key: 'id_producto' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      almacen_destino_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'almacenes', key: 'id_almacen' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      usuario_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ordenes_compra');
    await queryInterface.dropTable('movimientos_stock');
    await queryInterface.dropTable('inventario_almacen');
    await queryInterface.dropTable('productos');
    await queryInterface.dropTable('tipos_movimiento');
    await queryInterface.dropTable('proveedores');
    await queryInterface.dropTable('almacenes');
    await queryInterface.dropTable('unidades_medida');
    await queryInterface.dropTable('marcas');
    await queryInterface.dropTable('categorias');
    await queryInterface.dropTable('usuarios');
  }
};
