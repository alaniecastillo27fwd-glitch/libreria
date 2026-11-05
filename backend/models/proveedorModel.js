"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Editorial extends Model {
    static associate(models) {
      if (models.Libro) {
        Editorial.hasMany(models.Libro, {
          foreignKey: "id_editorial",
          as: "libros",
        });
      }
    }
  }

  Editorial.init(
    {
      id_editorial: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      pais: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      provincia: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Central",
      },
      ciudad: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Capital",
      },
    },
    {
      sequelize,
      modelName: "Editorial",
      tableName: "editoriales",
      timestamps: false,
    }
  );

  return Editorial;
};
