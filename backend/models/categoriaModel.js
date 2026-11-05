"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Genero extends Model {
    static associate(models) {
      if (models.Libro && models.LibroGenero) {
        Genero.belongsToMany(models.Libro, {
          through: models.LibroGenero,
          foreignKey: "id_genero",
          otherKey: "id_libro",
          as: "libros",
        });
      }
    }
  }

  Genero.init(
    {
      id_genero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreGenero: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      id_posicion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      id_forma_gramatical: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "Genero",
      tableName: "generos",
      timestamps: false,
    }
  );

  return Genero;
};
