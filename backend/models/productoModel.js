"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Libro extends Model {
    static associate(models) {
      if (models.Editorial) {
        Libro.belongsTo(models.Editorial, {
          foreignKey: "id_editorial",
          as: "editorial",
        });
      }
      if (models.Autor && models.LibroAutor) {
        Libro.belongsToMany(models.Autor, {
          through: models.LibroAutor,
          foreignKey: "id_libro",
          otherKey: "id_autor",
          as: "autores",
        });
      }
      if (models.Genero && models.LibroGenero) {
        Libro.belongsToMany(models.Genero, {
          through: models.LibroGenero,
          foreignKey: "id_libro",
          otherKey: "id_genero",
          as: "generos",
        });
      }
      if (models.Venta) {
        Libro.hasMany(models.Venta, {
          foreignKey: "id_libro",
          as: "ventas",
        });
      }
      if (models.Resena) {
        Libro.hasMany(models.Resena, {
          foreignKey: "id_libro",
          as: "resenas",
        });
      }
    }
  }

  Libro.init(
    {
      id_libro: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_editorial: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      numPaginas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      precioLibro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Libro",
      tableName: "libros",
      timestamps: false,
    }
  );

  return Libro;
};
