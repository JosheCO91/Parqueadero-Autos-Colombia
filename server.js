const app = require('./app');

const port = process.env.PORT || 4000;

app.get('*', (req, res) => {
  res.status(404).json({ msj: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(` Servidor de parqueadero funcionando en puerto: ${port}`);
});