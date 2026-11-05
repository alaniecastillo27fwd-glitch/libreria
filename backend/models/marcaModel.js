"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Autor extends Model {
    static associate(models) {
      if (models.Nacionalidad) {
        Autor.belongsTo(models.Nacionalidad, {
          foreignKey: "id_nacionalidad",
          as: "nacionalidad",
        });
      }
      if (models.Libro && models.LibroAutor) {
        Autor.belongsToMany(models.Libro, {
          through: models.LibroAutor,
          foreignKey: "id_autor",
          otherKey: "id_libro",
          as: "libros",
        });
      }
    }
  }

  Autor.init(
    {
      id_autor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      id_nacionalidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "Autor",
      tableName: "autores",
      timestamps: false,
    }
  );

  return Autor;
};
