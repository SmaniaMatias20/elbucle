const nodemailer = require("nodemailer");
const path = require("path");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error de conexión SMTP:", error);
    } else {
        console.log("✅ Servidor SMTP listo para enviar correos");
    }
});


async function notifyUserStatus(user, status) {
    const { name, email } = user;

    if (!email) {
        console.log("⚠️ Este usuario no tiene email, no se envía notificación.");
        return;
    }

    let mensaje = "";

    if (status === "activo") {
        mensaje = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #28a745;">✅ Registro Aceptado</h2>
          <p>Estimado/a <strong>${name}</strong>,</p>
          <p>¡Felicidades! Su registro en <strong>El Bucle</strong> ha sido aceptado. 
          Ahora puede iniciar sesión y disfrutar de nuestros servicios.</p>
          <p>Atentamente,<br><strong>El equipo de El Bucle</strong></p>
          <img src="cid:logoimg" alt="logo" width="120" height="120">
        </div>
        `;
    } else if (status === "rechazado") {
        mensaje = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #dc3545;">❌ Registro Rechazado</h2>
          <p>Estimado/a <strong>${name}</strong>,</p>
          <p>Lamentamos informarle que su registro en <strong>El Bucle</strong> no fue aprobado.</p>
          <p>Si cree que hubo un error, por favor contáctenos.</p>
          <p>Atentamente,<br><strong>El equipo de El Bucle</strong></p>
          <img src="cid:logoimg" alt="logo" width="120" height="120">
        </div>
        `;
    }

    try {
        await transporter.sendMail({
            from: `"El Bucle" <bucleinfinito2025@gmail.com>`,
            to: email,
            subject: "Estado de su registro en El Bucle",
            html: mensaje,
            attachments: [
                {
                    filename: 'bucle.png',
                    path: path.join(__dirname, 'bucle.png'),
                    cid: 'logoimg'
                }
            ],
        });
        console.log(`✅ Correo enviado a ${email} (${status})`);
    } catch (error) {
        console.error(`❌ Error enviando correo a ${email}:`, error);
    }
}

module.exports = { notifyUserStatus };
