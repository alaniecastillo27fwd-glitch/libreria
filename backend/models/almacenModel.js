"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Factura extends Model {
    static associate(models) {
      if (models.Venta) {
        Factura.hasMany(models.Venta, {
          foreignKey: "id_factura",
          as: "ventas",
        });
      }
    }
  }

  Factura.init(
    {
      id_factura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreLibreria: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fechaFactura: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_cajero: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      precio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      descuento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Factura",
      tableName: "facturas",
      timestamps: false,
    }
  );

  return Factura;
};
