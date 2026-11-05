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

// Alias de compatibilidad
db.Producto = db.Libro;
db.Categoria = db.Genero;
db.Proveedor = db.Editorial;
db.Marca = db.Autor;

db.conectarBaseDeDatos = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    await connection.changeUser({ database: config.database });

    // 1. Asegurar que la tabla `usuarios` de `libreria` soporte autenticación JWT (columnas password y fecha_creacion)
    const [colPass] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'password'`,
      [config.database]
    );
    if (colPass.length === 0) {
      await connection.query(
        `ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) NULL`
      );
    }

    const [colFecha] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'fecha_creacion'`,
      [config.database]
    );
    if (colFecha.length === 0) {
      await connection.query(
        `ALTER TABLE usuarios ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP`
      );
    }

    // Ampliar longitud de `titulo` en `libros` para permitir títulos completos
    await connection
      .query(`ALTER TABLE libros MODIFY COLUMN titulo VARCHAR(150) NOT NULL`)
      .catch(() => {});

    // 2. Migrar usuarios autenticados previos desde artsupply_db.usuarios si existen
    try {
      const [usuariosPrevios] = await connection.query(
        `SELECT nombre, correo, password FROM artsupply_db.usuarios`
      );
      for (const u of usuariosPrevios) {
        const [existe] = await connection.query(
          `SELECT id_usuario FROM usuarios WHERE correo = ? LIMIT 1`,
          [u.correo]
        );
        if (existe.length === 0) {
          await connection.query(
            `INSERT INTO usuarios (nombre, correo, telefono, id_rol_usuario, es_miembro, password) VALUES (?, ?, 88810099, 1, 1, ?)`,
            [u.nombre.slice(0, 50), u.correo.slice(0, 50), u.password]
          );
        } else {
          await connection.query(
            `UPDATE usuarios SET password = COALESCE(password, ?) WHERE correo = ?`,
            [u.password, u.correo]
          );
        }
      }
    } catch {
      // Ignorar si artsupply_db no existe
    }

    // 3. Asegurar catálogos base (posicion, formagramatical, generos) en `libreria`
    await connection.query(`
      INSERT IGNORE INTO posicion (id_Posicion, posicion) VALUES
      (1, 'Principal'),
      (2, 'Secundario');
    `);

    await connection.query(`
      INSERT IGNORE INTO formagramatical (id_forma_gramatical, forma) VALUES
      (1, 'Sustantivo'),
      (2, 'Adjetivo');
    `);

    const [generosCount] = await connection.query(
      `SELECT COUNT(*) AS total FROM generos`
    );
    if (generosCount[0].total === 0) {
      await connection.query(`
        INSERT IGNORE INTO generos (id_genero, nombreGenero, id_posicion, id_forma_gramatical) VALUES
        (1, 'Novela Histórica y Romance', 1, 1),
        (2, 'Ciencia Ficción Cuántica', 1, 1),
        (3, 'Fantasía Épica y Sueños', 1, 1),
        (4, 'Terror Gótico y Suspenso', 1, 1),
        (5, 'Misterio y Policial', 1, 1),
        (6, 'Aventura y Acción', 1, 1),
        (7, 'Ensayo y Ficción Social', 1, 1);
      `);
    }

    // 4. Vincular libros existentes con sus autores (libros_autores) y géneros (libro_genero) si las tablas puente están vacías
    const [librosRows] = await connection.query(
      `SELECT id_libro, id_editorial, titulo FROM libros ORDER BY id_libro ASC`
    );

    for (const libro of librosRows) {
      const idxRelacion = ((Number(libro.id_editorial) - 1) % 7) + 1;

      const [autorVinculado] = await connection.query(
        `SELECT id_Libros_Autores FROM libros_autores WHERE id_libro = ? LIMIT 1`,
        [libro.id_libro]
      );
      if (autorVinculado.length === 0) {
        await connection
          .query(
            `INSERT INTO libros_autores (id_libro, id_autor) VALUES (?, ?)`,
            [libro.id_libro, idxRelacion]
          )
          .catch(() => {});
      }

      const [generoVinculado] = await connection.query(
        `SELECT id_Libros_Generos FROM libro_genero WHERE id_libro = ? LIMIT 1`,
        [libro.id_libro]
      );
      if (generoVinculado.length === 0) {
        await connection
          .query(
            `INSERT INTO libro_genero (id_genero, id_subgenero, id_libro) VALUES (?, ?, ?)`,
            [idxRelacion, idxRelacion, libro.id_libro]
          )
          .catch(() => {});
      }
    }

    await connection.end();
    await sequelize.authenticate();

    console.log(
      `Conexión exitosa a la base de datos MySQL (${config.database}) con tablas de librería sincronizadas.`
    );
  } catch (error) {
    console.error("Aviso de conexión MySQL:", error.message);
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
