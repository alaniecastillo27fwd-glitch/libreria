"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Almacen extends Model {
    static associate(models) {
      Almacen.hasMany(models.InventarioAlmacen, {
        foreignKey: "almacen_id",
        as: "inventarios"
      });
      Almacen.hasMany(models.MovimientoStock, {
        foreignKey: "almacen_id",
        as: "movimientos"
      });
      Almacen.hasMany(models.OrdenCompra, {
        foreignKey: "almacen_destino_id",
        as: "ordenes_compra"
      });
    }
  }

  Almacen.init(
    {
      id_almacen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo_almacen: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      ubicacion: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      tipo_ambiente: {
        type: DataTypes.ENUM("ESTANDAR", "CLIMATIZADO", "SECO_CONTROLADO"),
        allowNull: false,
        defaultValue: "ESTANDAR"
      }
    },
    {
      sequelize,
      modelName: "Almacen",
      tableName: "almacenes",
      timestamps: false
    }
  );

  return Almacen;
};
