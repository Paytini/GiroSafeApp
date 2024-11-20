const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración para enviar alertas a MongoDB o a otro servicio
const enviarAlerta = async (req, res) => {
  const { alerta, datos } = req.body;

  if (!alerta || !datos) {
      return res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
  }

  try {
      // Aquí podrías enviar los datos de la alerta a MongoDB, un servicio externo, o a tu propio backend
      console.log(`Alerta recibida: ${alerta}`, datos);

      // Simulación de almacenamiento o procesamiento de la alerta
      // Podrías usar un cliente de MongoDB u otro servicio aquí.

      res.status(200).json({ success: true, message: 'Alerta procesada exitosamente.' });
  } catch (error) {
      console.error('Error al procesar la alerta:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};

// Función para enviar correos electrónicos con OAuth2 usando Nodemailer
const enviarCorreo = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, message } = req.body;

  try {
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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🚨 Alerta de Emergencia desde GiroSAFE 🚨',
      text: message,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Configura la ruta para mandar correos
app.post('/api/mandar-email', enviarCorreo);
app.post('/api/alert', enviarAlerta);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
