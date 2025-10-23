const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const path = require("path");
require('dotenv').config();
const fs = require('fs');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function notifyUserStatus(user, statusString) {
  const { name, email } = user;

  if (!email) {
    console.log("⚠️ Este usuario no tiene email, no se envía notificación.");
    return;
  }

  // const imagePath = path.join(__dirname, 'bucle.png');
  // const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  // const imageSrc = `data:image/png;base64,${imageBase64}`;
  const imageSrc = `https://elbucle.onrender.com/public/bucle.png`;


  let mensaje = "";

  if (statusString === "activo") {
    mensaje = `
<div style="background-color:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
<!-- Header -->
<div style="background-color:#28a745; padding:10px; text-align:center;">

  <!-- Logo recreado en HTML y CSS inline -->
  <div style="display:inline-block; text-align:center;">
    <div style="display:inline-block;">
      <!-- Símbolo infinito -->
      <span style="
        display:inline-block;
        color:#f4d35e;
        font-size:200px;
        font-weight:bold;
        vertical-align:middle;
        margin-right:8px;
        line-height:1;
      ">
        ∞
      </span>
    </div>
  </div>

  <h1 style="color:#ffffff; margin:-9px 0 0; font-size:24px; line-height:1.1;">Registro Aceptado</h1>
</div>


    <!-- Body -->
    <div style="padding:30px; color:#333333;">
      <p style="font-size:16px;">Estimado/a <strong>${name}</strong>,</p>
      <p style="font-size:16px; line-height:1.6;">
        ¡Nos complace informarle que su registro en <strong>El Bucle</strong> ha sido 
        <span style="color:#28a745; font-weight:bold;">aceptado</span>!  
        Ya puede acceder a su cuenta y comenzar a disfrutar de todas las funcionalidades que ofrecemos.
      </p>

      <p style="font-size:15px; line-height:1.6;">
        Si tiene alguna duda o necesita ayuda, puede contactarnos respondiendo a este correo o a través de nuestro sitio web.
      </p>

      <p style="margin-top:30px; font-size:15px;">
        Atentamente,<br>
        <strong>El equipo de El Bucle</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9f9f9; padding:20px; text-align:center; font-size:13px; color:#777;">
      <p style="margin:0;">© ${new Date().getFullYear()} El Bucle. Todos los derechos reservados.</p>
      <p style="margin:5px 0 0;">Este correo fue enviado automáticamente, por favor no lo responda directamente.</p>
    </div>

  </div>
</div>

    `;
  } else if (statusString === "inactivo") {
    mensaje = `
<div style="background-color:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
    
    <!-- Encabezado -->
    <div style="background-color:#dc3545; padding:10px; text-align:center;">

      <!-- Logo recreado en HTML y CSS inline -->
      <div style="display:inline-block; text-align:center;">
        <div style="display:inline-block;">
          <!-- Símbolo infinito -->
          <span style="
            display:inline-block;
            color:#f4d35e;
            font-size:200px;
            font-weight:bold;
            vertical-align:middle;
            margin-right:8px;
            line-height:1;
          ">
            ∞
          </span>
        </div>
      </div>

      <h1 style="color:#ffffff; margin:-9px 0 0; font-size:24px; line-height:1.1;">Registro Rechazado</h1>
    </div>

    <!-- Cuerpo -->
    <div style="padding:30px; color:#333333;">
      <p style="font-size:16px;">Estimado/a <strong>${name}</strong>,</p>
      <p style="font-size:16px; line-height:1.6;">
        Lamentamos informarle que su solicitud de registro en <strong>El Bucle</strong> no ha sido aprobada en esta ocasión.
      </p>
      <p style="font-size:16px; line-height:1.6;">
        Nuestro equipo revisa cuidadosamente cada registro para garantizar la mejor experiencia para todos los usuarios.
        Si considera que se trata de un error o desea obtener más información, puede ponerse en contacto con nosotros.
      </p>

      <p style="margin-top:30px; font-size:15px;">
        Atentamente,<br>
        <strong>El equipo de El Bucle</strong>
      </p>
    </div>

    <!-- Pie -->
    <div style="background-color:#f9f9f9; padding:20px; text-align:center; font-size:13px; color:#777;">
      <p style="margin:0;">© ${new Date().getFullYear()} El Bucle. Todos los derechos reservados.</p>
      <p style="margin:5px 0 0;">Este correo fue enviado automáticamente, por favor no lo responda directamente.</p>
    </div>

  </div>
</div>

    `;
  }

  const msg = {
    to: email,
    from: process.env.EMAIL,
    subject: "Estado de su registro en El Bucle",
    html: mensaje,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo enviado a ${email} (${statusString})`);
  } catch (error) {
    console.error(`❌ Error enviando correo a ${email}:`, error);
  }
}











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

//     // Leer la imagen y convertirla a base64 para SendGrid
//     const imageContent = fs.readFileSync(path.join(__dirname, 'bucle.png')).toString('base64');

//     const msg = {
//         to: email,
//         from: process.env.EMAIL, // tu correo verificado en SendGrid
//         subject: "Estado de su registro en El Bucle",
//         html: mensaje,
//         attachments: [
//             {
//                 content: imageContent,
//                 filename: "bucle.png",
//                 type: "image/png",
//                 disposition: "inline",
//                 content_id: "logoimg"
//             }
//         ]
//     };

//     try {
//         await sgMail.send(msg);
//         console.log(`✅ Correo enviado a ${email} (${statusString})`);
//     } catch (error) {
//         console.error(`❌ Error enviando correo a ${email}:`, error);
//     }
// }

module.exports = { notifyUserStatus };
