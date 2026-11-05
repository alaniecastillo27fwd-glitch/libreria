"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UnidadMedida extends Model {
    static associate(models) {
      UnidadMedida.hasMany(models.Producto, {
        foreignKey: "id_unidad",
        as: "productos"
      });
    }
  }

  UnidadMedida.init(
    {
      id_unidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      abreviatura: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      }
    },
    {
      sequelize,
      modelName: "UnidadMedida",
      tableName: "unidades_medida",
      timestamps: false
    }
  );

  return UnidadMedida;
};
