const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(express.json());

// Verificar que todas las variables de entorno necesarias estén cargadas
console.log("Correo:", process.env.EMAIL_USER);
console.log("Cliente OAuth2:", process.env.OAUTH_CLIENTID ? "Cargado" : "No cargado");
console.log("Secreto OAuth2:", process.env.OAUTH_CLIENT_SECRET ? "Cargado" : "No cargado");
console.log("Token de actualización:", process.env.OAUTH_REFRESH_TOKEN ? "Cargado" : "No cargado");

// Función para crear el transportador de Nodemailer usando OAuth2
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
    });
};

// Ruta para enviar el correo de emergencia
app.post('/send-emergency-email', (req, res) => {
    const { email, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🚨 Alerta de Emergencia desde GiroSAFE 🚨',
        text: message,
    };

    const transporter = createTransporter();

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            return res.status(500).json({ success: false, error: error.message });
        } else {
            console.log('Correo enviado:', info.response);
            res.status(200).json({ success: true, info });
        }
    });
});

// Iniciar el servidor en el puerto especificado o en el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
