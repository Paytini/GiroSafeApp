const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Simularemos una base de datos en memoria para almacenar contactos de emergencia
const contactosEmergencia = {};

// Ruta para guardar los contactos de emergencia de un usuario
app.post('/api/guardar-contactos', (req, res) => {
  const { userId, contactos } = req.body;

  if (!userId || !contactos) {
    return res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
  }

  // Guardar los contactos en la "base de datos" en memoria
  contactosEmergencia[userId] = contactos;
  console.log(`Contactos de emergencia guardados para el usuario ${userId}:`, contactos);

  res.status(200).json({ success: true, message: 'Contactos guardados correctamente.' });
});

// Ruta para manejar alertas y enviar correos a contactos de emergencia
app.post('/api/alert', async (req, res) => {
  const { userId, alerta, datos } = req.body;

  if (!userId || !alerta) {
    return res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
  }

  try {
    // Obtener contactos de emergencia del usuario
    const contactos = contactosEmergencia[userId];
    if (!contactos || contactos.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay contactos de emergencia guardados para este usuario.' });
    }

    console.log(`Procesando alerta para el usuario ${userId}:`, alerta, datos);

    // Configura el transportador de Nodemailer con OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    // Enviar correos a cada contacto
    for (const contacto of contactos) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contacto.email,
        subject: '🚨 Alerta de Emergencia desde GiroSAFE 🚨',
        text: `Hola ${contacto.nombre},\n\nSe ha activado una alerta de emergencia para el usuario ${userId}. Por favor, revisa esta situación.\n\nDetalles:\n${JSON.stringify(datos)}\n\nGracias.`,
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${contacto.email}`);
    }

    res.status(200).json({ success: true, message: 'Alerta procesada y correos enviados.' });
  } catch (error) {
    console.error('Error al procesar la alerta o enviar correos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
