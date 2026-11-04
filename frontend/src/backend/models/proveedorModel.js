"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.OrdenCompra, {
        foreignKey: "proveedor_id",
        as: "ordenes_compra"
      });
    }
  }

  Proveedor.init(
    {
      id_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      identificacion_fiscal: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      contacto: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      correo_comercial: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Proveedor",
      tableName: "proveedores",
      timestamps: false
    }
  );

  return Proveedor;
};
