"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TipoMovimiento extends Model {
    static associate(models) {
      TipoMovimiento.hasMany(models.MovimientoStock, {
        foreignKey: "tipo_movimiento_id",
        as: "movimientos"
      });
    }
  }

  TipoMovimiento.init(
    {
      id_tipo_movimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      naturaleza: {
        type: DataTypes.ENUM("ENTRADA", "SALIDA", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "TipoMovimiento",
      tableName: "tipos_movimiento",
      timestamps: false
    }
  );

  return TipoMovimiento;
};
