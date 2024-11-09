const express = require('express');
const app = express();
const enviarCorreo = require('../GiroSafeApp_Backend/api//mandar-email'); // Importa el archivo correctamente
app.use(express.json());

// Configura la ruta
app.post('/api/mandar-email', enviarCorreo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
