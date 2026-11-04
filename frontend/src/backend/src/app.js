const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicialización del pool de base de datos y verificación de conexión
require('./config/db');

const productoRoutes = require('./routes/productoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración explícita de CORS para interoperabilidad con el cliente React en Vite
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })
);

// Middleware para parseo de cuerpos en formato JSON
app.use(express.json());

// Montaje de rutas de la API REST
app.use('/api/productos', productoRoutes);

// Middleware global para manejo de rutas no encontradas (404)
app.use((req, res) => {
  return res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method
  });
});

// Arranque del servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express de ArtSupply Pro ejecutándose en el puerto ${PORT}`);
  console.log(`🔗 Endpoint principal disponible en: http://localhost:${PORT}/api/productos`);
});

module.exports = app;

