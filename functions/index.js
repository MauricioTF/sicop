const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

// Configura el transportador SMTP usando Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'otrascuentas99@gmail.com', // Reemplaza con tu correo de Gmail
    pass: 'hpug fhkv nijc ormd', // Reemplaza con la contraseña de aplicación generada
  },
});

exports.sendEmail = functions.https.onRequest((req, res) => {
  // Usar CORS para permitir solicitudes desde cualquier origen durante el desarrollo
  cors(req, res, () => {
    if (req.method !== 'POST') {
      // return res.status(400).send('Method Not Allowed');
    }

    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      // return res.status(400).send('Missing parameters: "to", "subject", or "body"');
    }

    const mailOptions = {
      from: 'otrascuentas99@gmail.com', // Reemplaza con tu correo
      to: to,
      subject: subject,
      text: body,
      html: `<p>${body}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        // return res.status(500).send('Error al enviar el correo: ' + error.toString());
      }
      console.log('Correo enviado:', info.response);
      // return res.status(200).send('Email sent: ' + info.response);
    });
  });
});
