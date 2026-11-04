"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsTo(models.Categoria, {
        foreignKey: "id_categoria",
        as: "categoria"
      });
      Producto.belongsTo(models.Marca, {
        foreignKey: "id_marca",
        as: "marca"
      });
      Producto.belongsTo(models.UnidadMedida, {
        foreignKey: "id_unidad",
        as: "unidad"
      });
      Producto.hasMany(models.InventarioAlmacen, {
        foreignKey: "producto_id",
        as: "inventarios"
      });
      Producto.hasMany(models.MovimientoStock, {
        foreignKey: "producto_id",
        as: "movimientos"
      });
      Producto.hasMany(models.OrdenCompra, {
        foreignKey: "producto_id",
        as: "ordenes_compra"
      });
    }
  }

  Producto.init(
    {
      id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo_sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      precio_compra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      precio_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_marca: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_unidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "productos",
      timestamps: false
    }
  );

  return Producto;
};
