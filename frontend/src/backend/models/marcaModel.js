"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Marca extends Model {
    static associate(models) {
      Marca.hasMany(models.Producto, {
        foreignKey: "id_marca",
        as: "productos"
      });
    }
  }

  Marca.init(
    {
      id_marca: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      pais_origen: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: "Internacional"
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Marca",
      tableName: "marcas",
      timestamps: false
    }
  );

  return Marca;
};
