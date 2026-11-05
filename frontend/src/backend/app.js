const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./models/");

const app = express();

app.use(cors());
app.use(express.json());

// Conectar y sincronizar la base de datos MySQL con Sequelize
db.conectarBaseDeDatos();

const productoRoute = require("./routes/productoRoutes");

app.use("/producto", productoRoute);
app.use("/productos", productoRoute);
app.use("/api/productos", productoRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto http://localhost:${PORT}`);
});
