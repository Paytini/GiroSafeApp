// Actualiza el código para sobrescribir contactos en la memoria
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Simularemos una base de datos en memoria para almacenar contactos
const contactosEmergencia = {};

// Ruta para guardar los contactos de emergencia de un usuario
app.post('/api/guardar-contactos', (req, res) => {
  const { userId, contactos } = req.body;

  if (!userId || !contactos) {
    return res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
  }

  // Sobrescribir los contactos para el usuario dado
  contactosEmergencia[userId] = contactos;
  console.log(`Contactos de emergencia actualizados para el usuario ${userId}:`, contactos);

  res.status(200).json({ success: true, message: 'Contactos actualizados correctamente.' });
});

// Ruta para manejar alertas y enviar correos a contactos de emergencia
app.post('/api/alert', async (req, res) => {
  const { userId, alerta, datos } = req.body;

  if (!userId || !alerta) {
    return res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
  }

  try {
    // Obtener contactos del usuario
    const contactos = contactosEmergencia[userId];
    if (!contactos || contactos.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay contactos guardados para este usuario.' });
    }

    // Configurar transportador de Nodemailer con OAuth2
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

    // Enviar correos a contactos
    for (const contacto of contactos) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contacto.email,
        subject: '🚨 Alerta de Emergencia desde GiroSAFE 🚨',
        text: `Hola ${contacto.nombre},\n\nSe ha activado una alerta de emergencia. Revisa los detalles:\n${JSON.stringify(datos)}\n\nGracias.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${contacto.email}`);
    }

    res.status(200).json({ success: true, message: 'Alerta procesada y correos enviados.' });
  } catch (error) {
    console.error('Error al enviar correos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
