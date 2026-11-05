const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./models/");

const app = express();

app.use(cors());
app.use(express.json());

// Conectar y sincronizar la base de datos MySQL `libreria` con Sequelize
db.conectarBaseDeDatos();

const authRoute = require("./routes/authRoutes");
const categoriaRoute = require("./routes/categoriaRoutes");
const proveedorRoute = require("./routes/proveedorRoutes");
const productoRoute = require("./routes/productoRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const { obtenerAutores } = require("./controllers/productoController");

// Rutas de Autenticación JWT
app.use("/api/auth", authRoute);

// Rutas de Géneros Literarios (tabla `generos` + alias `/categorias`)
app.use("/api/generos", categoriaRoute);
app.use("/generos", categoriaRoute);
app.use("/api/categorias", categoriaRoute);
app.use("/categorias", categoriaRoute);

// Rutas de Editoriales (tabla `editoriales` + alias `/proveedores`)
app.use("/api/editoriales", proveedorRoute);
app.use("/editoriales", proveedorRoute);
app.use("/api/proveedores", proveedorRoute);
app.use("/proveedores", proveedorRoute);

// Rutas de Libros (tabla `libros` con relaciones a `editoriales`, `autores`, `generos` + alias `/productos`)
app.use("/api/libros", productoRoute);
app.use("/libros", productoRoute);
app.use("/api/productos", productoRoute);
app.use("/productos", productoRoute);
app.use("/producto", productoRoute);

// Ruta de Autores (tabla `autores` con `nacionalidades`)
app.get("/api/autores", authMiddleware, obtenerAutores);
app.get("/autores", authMiddleware, obtenerAutores);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor de Librería corriendo en puerto http://localhost:${PORT}`);
});
