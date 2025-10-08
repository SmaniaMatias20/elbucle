const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const path = require("path");
require('dotenv').config();
const fs = require('fs');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const transporter = nodemailer.createTransport({
//     host: "smtp.sendgrid.net",
//     port: 587,
//     secure: false, // STARTTLS
//     auth: {
//         user: "apikey", // literal "apikey"
//         pass: process.env.SENDGRID_API_KEY,
//     },
// });

async function notifyUserStatus(user, statusString) {
    console.log(user, statusString);
    const { name, email } = user;

    if (!email) {
        console.log("⚠️ Este usuario no tiene email, no se envía notificación.");
        return;
    }

    let mensaje = "";

    if (statusString === "activo") {
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
    } else if (statusString === "inactivo") {
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

    // Leer la imagen y convertirla a base64 para SendGrid
    const imageContent = fs.readFileSync(path.join(__dirname, 'bucle.png')).toString('base64');

    const msg = {
        to: email,
        from: process.env.EMAIL, // tu correo verificado en SendGrid
        subject: "Estado de su registro en El Bucle",
        html: mensaje,
        attachments: [
            {
                content: imageContent,
                filename: "bucle.png",
                type: "image/png",
                disposition: "inline",
                content_id: "logoimg"
            }
        ]
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Correo enviado a ${email} (${statusString})`);
    } catch (error) {
        console.error(`❌ Error enviando correo a ${email}:`, error);
    }
}

// Verificar conexión
// transporter.verify((err, success) => {
//     if (err) {
//         console.error("❌ Error SMTP SendGrid:", err);
//     } else {
//         console.log("✅ Conexión SendGrid lista para enviar correos");
//     }
// });

// async function notifyUserStatus(user, statusString) {
//     console.log(user, statusString);
//     const { name, email } = user;

//     if (!email) {
//         console.log("⚠️ Este usuario no tiene email, no se envía notificación.");
//         return;
//     }

//     let mensaje = "";

//     if (statusString === "activo") {
//         mensaje = `
//         <div style="font-family: Arial, sans-serif; color: #333;">
//           <h2 style="color: #28a745;">✅ Registro Aceptado</h2>
//           <p>Estimado/a <strong>${name}</strong>,</p>
//           <p>¡Felicidades! Su registro en <strong>El Bucle</strong> ha sido aceptado. 
//           Ahora puede iniciar sesión y disfrutar de nuestros servicios.</p>
//           <p>Atentamente,<br><strong>El equipo de El Bucle</strong></p>
//           <img src="cid:logoimg" alt="logo" width="120" height="120">
//         </div>
//         `;
//     } else if (statusString === "inactivo") {
//         mensaje = `
//         <div style="font-family: Arial, sans-serif; color: #333;">
//           <h2 style="color: #dc3545;">❌ Registro Rechazado</h2>
//           <p>Estimado/a <strong>${name}</strong>,</p>
//           <p>Lamentamos informarle que su registro en <strong>El Bucle</strong> no fue aprobado.</p>
//           <p>Si cree que hubo un error, por favor contáctenos.</p>
//           <p>Atentamente,<br><strong>El equipo de El Bucle</strong></p>
//           <img src="cid:logoimg" alt="logo" width="120" height="120">
//         </div>
//         `;
//     }

//     try {
//         await transporter.sendMail({
//             from: `"El Bucle" <bucleinfinito2025@gmail.com>`,
//             to: email,
//             subject: "Estado de su registro en El Bucle",
//             html: mensaje,
//             attachments: [
//                 {
//                     filename: 'bucle.png',
//                     path: path.join(__dirname, 'bucle.png'),
//                     cid: 'logoimg'
//                 }
//             ],
//         });
//         console.log(`✅ Correo enviado a ${email} (${statusString})`);
//     } catch (error) {
//         console.error(`❌ Error enviando correo a ${email}:`, error);
//     }
// }

module.exports = { notifyUserStatus };
