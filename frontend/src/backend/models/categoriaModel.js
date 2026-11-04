"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      Categoria.hasMany(models.Producto, {
        foreignKey: "id_categoria",
        as: "productos"
      });
    }
  }

  Categoria.init(
    {
      id_categoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "Categoria",
      tableName: "categorias",
      timestamps: false
    }
  );

  return Categoria;
};
