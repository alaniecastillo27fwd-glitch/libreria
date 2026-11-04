"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/config.js"))[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const exported = require(path.join(__dirname, file));
    if (typeof exported === "function") {
      const model = exported(sequelize, Sequelize.DataTypes);
      if (model && model.name) {
        db[model.name] = model;
      }
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const PRODUCTOS_SEMILLA = [
  {
    codigo_sku: "OLE-WN-001",
    nombre: "Óleo Artists' Azul Ultramar 37ml",
    descripcion: "Pintura al óleo extrafina de alta concentración de pigmento PB29 con excelente resistencia a la luz.",
    precio_compra: 9.80,
    precio_venta: 18.50,
    stock_minimo: 25,
    id_categoria: 1,
    id_marca: 1,
    id_unidad: 1
  },
  {
    codigo_sku: "OLE-SEN-002",
    nombre: "Óleo Extrafino Amarillo de Cadmio Claro 37ml",
    descripcion: "Fórmula francesa cremosa con aceite de cártamo puro, luminosidad intensa y secado uniforme.",
    precio_compra: 12.40,
    precio_venta: 24.90,
    stock_minimo: 15,
    id_categoria: 1,
    id_marca: 4,
    id_unidad: 1
  },
  {
    codigo_sku: "PAP-FAB-300",
    nombre: "Pliego Papel Acuarela Artistico 300g Grano Fino",
    descripcion: "Papel 100% algodón prensado en frío, libre de ácido y cloro, ideal para lavados húmedos.",
    precio_compra: 4.50,
    precio_venta: 9.75,
    stock_minimo: 40,
    id_categoria: 4,
    id_marca: 2,
    id_unidad: 2
  },
  {
    codigo_sku: "PIN-ESC-008",
    nombre: "Set Pinceles Kolinsky Reserva Redondos (Caja x12)",
    descripcion: "Pelo natural de marta Kolinsky macho, punta perfecta y máxima capacidad de retención de agua.",
    precio_compra: 85.00,
    precio_venta: 149.90,
    stock_minimo: 8,
    id_categoria: 3,
    id_marca: 3,
    id_unidad: 3
  },
  {
    codigo_sku: "LIE-BEL-010",
    nombre: "Rollo de Lino Belga Imprimado Universal 420g",
    descripcion: "Tejido cerrado de lino europeo con triple capa de gesso acrílico libre de ácido para gran formato.",
    precio_compra: 110.00,
    precio_venta: 195.00,
    stock_minimo: 5,
    id_categoria: 2,
    id_marca: 1,
    id_unidad: 4
  },
  {
    codigo_sku: "OLE-WN-014",
    nombre: "Óleo Profesional Carmesí Alizarina Permanente 37ml",
    descripcion: "Tono transparente profundo de alta permanencia para veladuras clásicas y mezclas de retrato.",
    precio_compra: 11.20,
    precio_venta: 21.50,
    stock_minimo: 20,
    id_categoria: 1,
    id_marca: 1,
    id_unidad: 1
  },
  {
    codigo_sku: "PAP-FAB-640",
    nombre: "Pliego Papel Grabado Tiepolo 290g 100% Algodón",
    descripcion: "Papel tradicional italiano con barbas en los cuatro lados para calcografía, litografía y serigrafía.",
    precio_compra: 5.10,
    precio_venta: 11.20,
    stock_minimo: 30,
    id_categoria: 4,
    id_marca: 2,
    id_unidad: 2
  },
  {
    codigo_sku: "PIN-ESC-021",
    nombre: "Caja Pinceles Sintéticos Perla Filbert #6 (x12)",
    descripcion: "Fibra sintética Toray blanca de alta elasticidad y nervio para acrílico, óleo y técnicas mixtas.",
    precio_compra: 42.00,
    precio_venta: 78.50,
    stock_minimo: 12,
    id_categoria: 3,
    id_marca: 3,
    id_unidad: 3
  }
];

db.PRODUCTOS_SEMILLA = PRODUCTOS_SEMILLA;

db.conectarBaseDeDatos = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();

    await sequelize.authenticate();
    await sequelize.sync();

    if (db.Categoria) {
      const countCat = await db.Categoria.count();
      if (countCat === 0) {
        await db.Categoria.bulkCreate([
          { id_categoria: 1, nombre: "Pigmentos y Óleos Profesionales", descripcion: "Pinturas al óleo extrafinas y pigmentos puros." },
          { id_categoria: 2, nombre: "Lienzos y Soportes Rígidos", descripcion: "Bastidores entelados en lino belga y algodón." },
          { id_categoria: 3, nombre: "Pinceles y Espátulas Técnicas", descripcion: "Pinceles Kolinsky, sintéticos y espátulas." },
          { id_categoria: 4, nombre: "Papeles Técnicos y Acuarela", descripcion: "Papeles 100% algodón libres de ácido." }
        ]);
      }
    }

    if (db.Marca) {
      const countMarca = await db.Marca.count();
      if (countMarca === 0) {
        await db.Marca.bulkCreate([
          { id_marca: 1, nombre: "Winsor & Newton", pais_origen: "Reino Unido", descripcion: "Óleos y acuarelas de grado artístico." },
          { id_marca: 2, nombre: "Fabriano", pais_origen: "Italia", descripcion: "Papeles técnicos de algodón para bellas artes." },
          { id_marca: 3, nombre: "Escoda", pais_origen: "España", descripcion: "Pinceles artesanales de alta precisión." },
          { id_marca: 4, nombre: "Sennelier", pais_origen: "Francia", descripcion: "Pigmentos puros y pasteles extrafinos." }
        ]);
      }
    }

    if (db.UnidadMedida) {
      const countUnidad = await db.UnidadMedida.count();
      if (countUnidad === 0) {
        await db.UnidadMedida.bulkCreate([
          { id_unidad: 1, nombre: "Tubo de 37 Mililitros", abreviatura: "TUB-37ML" },
          { id_unidad: 2, nombre: "Pliego 56x76 Centímetros", abreviatura: "PLG-56X76" },
          { id_unidad: 3, nombre: "Caja Mayorista de 12 Unidades", abreviatura: "CAJ-12U" },
          { id_unidad: 4, nombre: "Rollo de 10 Metros Lineales", abreviatura: "ROL-10M" }
        ]);
      }
    }

    if (db.Producto) {
      const countProd = await db.Producto.count();
      if (countProd === 0) {
        await db.Producto.bulkCreate(PRODUCTOS_SEMILLA);
      }
    }

    console.log(`✅ Base de datos MySQL (${config.database}) conectada y sincronizada con productos semilla.`);
  } catch (error) {
    console.error("⚠️ Aviso de conexión MySQL (usando catálogo en memoria si MySQL no está activo):", error.message);
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
