const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Almacenamiento en memoria
let contactosPorUsuario = {};

// Configuración de Nodemailer (reutilizable)
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

// Endpoint para guardar contactos
app.post('/api/guardar-contactos', (req, res) => {
  const { userId, contactos } = req.body;

  try {
    if (!userId || !Array.isArray(contactos)) {
      return res.status(400).json({ success: false, message: 'Datos inválidos' });
    }

    // Guardar o sobrescribir contactos en memoria
    contactosPorUsuario[userId] = contactos;

    res.status(200).json({ success: true, message: 'Contactos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar contactos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función para enviar correos a múltiples destinatarios
const enviarCorreos = async (emails, message) => {
  try {
    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🚨 Alerta de Emergencia desde GiroSAFE 🚨',
        text: message,
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error al enviar correos:', error);
    throw new Error('Error al enviar los correos.');
  }
};

// Endpoint para manejar alertas del ESP32
app.post('/api/alerta-esp32', async (req, res) => {
  const { userId } = req.body;

  try {
    // Verificar si el usuario tiene contactos guardados
    const contactos = contactosPorUsuario[userId];
    if (!contactos) {
      return res.status(404).json({ success: false, message: 'No hay contactos de emergencia para este usuario' });
    }

    // Extraer los correos electrónicos de los contactos
    const emails = contactos.map(contact => contact.email);

    // Enviar correos a los contactos de emergencia
    await enviarCorreos(emails, 'Una alerta de emergencia fue activada. Verifica la situación del usuario.');

    res.status(200).json({ success: true, message: 'Alertas enviadas a contactos de emergencia' });
  } catch (error) {
    console.error('Error al procesar la alerta:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para enviar un correo específico
app.post('/api/mandar-email', async (req, res) => {
  const { email, message } = req.body;

  try {
    await enviarCorreos([email], message); // Reutiliza la función de envío de correos
    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configuración del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
