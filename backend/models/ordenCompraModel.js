"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      if (models.Libro) {
        Venta.belongsTo(models.Libro, {
          foreignKey: "id_libro",
          as: "libro",
        });
      }
      if (models.Factura) {
        Venta.belongsTo(models.Factura, {
          foreignKey: "id_factura",
          as: "factura",
        });
      }
    }
  }

  Venta.init(
    {
      id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_factura: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_libro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Venta",
      tableName: "ventas",
      timestamps: false,
    }
  );

  return Venta;
};
