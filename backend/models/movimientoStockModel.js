"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LibroGenero extends Model {
    static associate(models) {
      if (models.Libro) {
        LibroGenero.belongsTo(models.Libro, {
          foreignKey: "id_libro",
          as: "libro",
        });
      }
      if (models.Genero) {
        LibroGenero.belongsTo(models.Genero, {
          foreignKey: "id_genero",
          as: "genero",
        });
      }
    }
  }

  LibroGenero.init(
    {
      id_Libros_Generos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_genero: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_subgenero: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_libro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LibroGenero",
      tableName: "libro_genero",
      timestamps: false,
    }
  );

  return LibroGenero;
};
