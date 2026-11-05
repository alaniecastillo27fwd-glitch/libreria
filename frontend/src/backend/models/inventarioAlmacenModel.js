"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InventarioAlmacen extends Model {
    static associate(models) {
      InventarioAlmacen.belongsTo(models.Producto, {
        foreignKey: "producto_id",
        as: "producto"
      });
      InventarioAlmacen.belongsTo(models.Almacen, {
        foreignKey: "almacen_id",
        as: "almacen"
      });
    }
  }

  InventarioAlmacen.init(
    {
      id_inventario_almacen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      almacen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      stock_actual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      stock_maximo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 500
      },
      pasillo_estante: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      ultima_conciliacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "InventarioAlmacen",
      tableName: "inventario_almacen",
      timestamps: false
    }
  );

  return InventarioAlmacen;
};
