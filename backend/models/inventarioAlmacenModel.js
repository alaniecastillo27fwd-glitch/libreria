"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LibroAutor extends Model {
    static associate(models) {
      if (models.Libro) {
        LibroAutor.belongsTo(models.Libro, {
          foreignKey: "id_libro",
          as: "libro",
        });
      }
      if (models.Autor) {
        LibroAutor.belongsTo(models.Autor, {
          foreignKey: "id_autor",
          as: "autor",
        });
      }
    }
  }

  LibroAutor.init(
    {
      id_Libros_Autores: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_libro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_autor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LibroAutor",
      tableName: "libros_autores",
      timestamps: false,
    }
  );

  return LibroAutor;
};
