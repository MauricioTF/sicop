const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

// Configura el transportador SMTP usando Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemadegestiondeincidencias@gmail.com', // Reemplaza con tu correo de Gmail
    pass: 'd c w v w vi p m r m g t d p r', // Reemplaza con la contraseña de aplicación generada
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
      from: 'sistemadegestiondeincidencias@gmail.com', // Reemplaza con tu correo
      to: to,
      subject: subject,
      text: body,
      html: `
        <div style="background-color: #f3f3f3; padding: 20px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color: #ffffff; border: 1px solid #ddd; padding: 20px; font-family: Arial, sans-serif;">
            <tr>
              <td style="text-align: center; padding: 10px;">
                <img src="https://firebasestorage.googleapis.com/v0/b/sicop-is.appspot.com/o/logo%2Flogo_sgi.png?alt=media&token=8b9f0aaa-37f3-48c7-a88c-13fb95e24783" alt="Logo" style="width: 600px;">
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; font-size: 20px; color: #333;">
                ${subject}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; font-size: 16px; color: #555;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; color: #aaa; font-size: 12px;">
                <p>Este es un correo electrónico automático. Por favor, no responda a este mensaje.</p>
                <p>© 2024 Universidad de Costa Rica</p>
              </td>
            </tr>
          </table>
        </div>
      `,
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
