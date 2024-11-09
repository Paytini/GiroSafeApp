const nodemailer = require('nodemailer');

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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Exporta la función para usarla como middleware en Express
module.exports = enviarCorreo;
