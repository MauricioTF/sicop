// Importa las funciones de Firebase para poder crear funciones en la nube.
const functions = require('firebase-functions');
// Importa nodemailer, una librería para enviar correos electrónicos desde Node.js.
const nodemailer = require('nodemailer');
// Importa y configura CORS para permitir solicitudes de origen cruzado.
const cors = require('cors')({ origin: true });

// Configura el transportador SMTP usando Gmail para enviar correos electrónicos.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Especifica que se usará Gmail como servicio de correo.
  auth: {
    user: 'sistemadegestiondeincidencias@gmail.com', // Dirección de correo electrónico del remitente.
    pass: 'd c w v w vi p m r m g t d p r', // Contraseña del correo electrónico del remitente.
  },
});

// Crea una función en la nube de Firebase que se activa con solicitudes HTTP.
exports.sendEmail = functions.https.onRequest((req, res) => {

  // Aplica CORS a la solicitud y proporciona un callback para continuar el proceso.
  cors(req, res, () => {
    // Verifica si el método de la solicitud es POST; si no, devuelve un error 400.
    if (req.method !== 'POST') {
      return res.status(400).send('Method Not Allowed');
    }

    // Extrae los parámetros to, subject y body de la solicitud.
    const { to, subject, body } = req.body;

    // Verifica si alguno de los parámetros necesarios falta y devuelve un error 400 si es así.
    if (!to || !subject || !body) {
      return res.status(400).send('Buscando los pramaetros: "to", "subject", or "body"');
    }

    // Configura las opciones del correo electrónico a enviar.
    const mailOptions = {
      from: 'sistemadegestiondeincidencias@gmail.com', // Dirección del remitente.
      to: to, // Dirección del destinatario.
      subject: subject, // Asunto del correo.
      text: body, // Cuerpo del correo en texto plano.
      html: `
        <div style="background-color: #f3f3f3; padding: 20px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color: #ffffff; border: 1px solid #ddd; padding: 20px; font-family: Arial, sans-serif;">
            <tr>
              <td style="text-align: center; padding: 10px;">
                <img src="https://firebasestorage.googleapis.com/v0/b/sicop-is.appspot.com/o/logo%2Flogo_sgi.png?alt=media&token=8b9f0aaa-37f3-48c7-a88c-13fb95e24783" alt="Logo" style="width: 400px;">
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
      `, // Cuerpo del correo en formato HTML.
    };

    // Envía el correo electrónico con las opciones especificadas.
    transporter.sendMail(mailOptions, (error, info) => {
      // Si ocurre un error al enviar el correo, lo registra y devuelve un error 500.
      if (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).send('Error al enviar el correo: ' + error.toString());
      }
      // Si el correo se envía correctamente, registra la respuesta y devuelve un éxito 200.
      console.log('Correo enviado:', info.response);
      return res.status(200).send('Correo Enviado: ' + info.response);
    });
  });
});