"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Usuario extends Model {
    static associate() {}

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "id_usuario",
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      correo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 88810000,
      },
      id_rol_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      es_miembro: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: "fecha_creacion",
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "usuarios",
      timestamps: false,
    }
  );

  return Usuario;
};
