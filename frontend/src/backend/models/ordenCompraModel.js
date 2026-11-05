"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrdenCompra extends Model {
    static associate(models) {
      OrdenCompra.belongsTo(models.Proveedor, {
        foreignKey: "proveedor_id",
        as: "proveedor"
      });
      OrdenCompra.belongsTo(models.Producto, {
        foreignKey: "producto_id",
        as: "producto"
      });
      OrdenCompra.belongsTo(models.Almacen, {
        foreignKey: "almacen_destino_id",
        as: "almacen_destino"
      });
    }
  }

  OrdenCompra.init(
    {
      id_orden_compra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_orden: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
      },
      cantidad_solicitada: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      precio_unitario_pactado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      monto_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_pedido: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      fecha_recepcion_estimada: {
        type: DataTypes.DATE,
        allowNull: true
      },
      estado: {
        type: DataTypes.ENUM("PENDIENTE", "APROBADA", "EN_TRANSITO", "RECIBIDA", "CANCELADA"),
        allowNull: false,
        defaultValue: "PENDIENTE"
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      almacen_destino_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "OrdenCompra",
      tableName: "ordenes_compra",
      timestamps: false
    }
  );

  return OrdenCompra;
};
