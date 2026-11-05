"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Nacionalidad extends Model {
    static associate(models) {
      if (models.Autor) {
        Nacionalidad.hasMany(models.Autor, {
          foreignKey: "id_nacionalidad",
          as: "autores",
        });
      }
    }
  }

  Nacionalidad.init(
    {
      id_nacionalidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_nacionalidad: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Nacionalidad",
      tableName: "nacionalidades",
      timestamps: false,
    }
  );

  return Nacionalidad;
};
