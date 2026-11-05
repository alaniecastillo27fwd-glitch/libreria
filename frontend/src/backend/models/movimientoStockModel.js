"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MovimientoStock extends Model {
    static associate(models) {
      MovimientoStock.belongsTo(models.Producto, {
        foreignKey: "producto_id",
        as: "producto"
      });
      MovimientoStock.belongsTo(models.Almacen, {
        foreignKey: "almacen_id",
        as: "almacen"
      });
      MovimientoStock.belongsTo(models.TipoMovimiento, {
        foreignKey: "tipo_movimiento_id",
        as: "tipo_movimiento"
      });
    }
  }

  MovimientoStock.init(
    {
      id_movimiento_stock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      folio_movimiento: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      costo_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      almacen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tipo_movimiento_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "MovimientoStock",
      tableName: "movimientos_stock",
      timestamps: false
    }
  );

  return MovimientoStock;
};
