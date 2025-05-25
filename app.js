
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');


const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error(' ERROR: No se encontró el archivo .env');
  process.exit(1);
}

dotenv.config({ path: envPath });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:4000', 'http://127.0.0.1:4000', 'null'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.static(path.join(__dirname, 'vistas')));


console.log(' Variables cargadas:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'EXISTE' : 'UNDEFINED',
  PORT: process.env.PORT
});
app.use(async (req, res, next) => {
  if (req.method === 'POST' && req.path.endsWith('/vehiculos')) {
    try {

      const indexes = await mongoose.connection.db.collection('vehiculos').indexes();
      const placaIndex = indexes.find(i => i.key.placa);

      if (!placaIndex || !placaIndex.unique) {
        console.warn('Índice único de placas no configurado correctamente');
        await mongoose.connection.db.collection('vehiculos').createIndex(
          { placa: 1 },
          { unique: true, collation: { locale: 'es', strength: 1 } }
        );
      }
    } catch (err) {
      console.error('Error verificando índices:', err);
    }
  }
  next();
});

if (!process.env.MONGODB_URI) {
  console.error(' ERROR: MONGODB_URI no está definido');
  process.exit(1);
}

console.log('🔗 URI de conexión:',
  process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@'));

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log(' Conectado a MongoDB Atlas'))
  .catch(err => console.error(' Error de conexión:', err.message));


const vehiculoRoutes = require('./rutas/vehiculoRuta');
const celdaRoutes = require('./rutas/espacioRuta');
const usuarioRoutes = require('./rutas/usuarioRuta');


app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    timestamp: new Date()
  });
});


app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/espacios', celdaRoutes);
app.use('/api/usuarios', usuarioRoutes);


app.get('/api/vehiculos/activos', async (req, res) => {
  try {
    const count = await Vehiculo.countDocuments({ estado: 'activo' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/celdas/disponibles', async (req, res) => {
  try {
    const count = await Celda.countDocuments({ ocupada: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;