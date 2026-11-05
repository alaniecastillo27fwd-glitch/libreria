"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Resena extends Model {
    static associate(models) {
      if (models.Libro) {
        Resena.belongsTo(models.Libro, {
          foreignKey: "id_libro",
          as: "libro",
        });
      }
    }
  }

  Resena.init(
    {
      id_resena: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_libro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      desccripcion: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      Positiva: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "Resena",
      tableName: "resenas",
      timestamps: false,
    }
  );

  return Resena;
};
