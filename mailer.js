const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const path = require("path");
require('dotenv').config();
const fs = require('fs');
const { send } = require("process");


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function notifyUserStatus(user, statusString) {
  const { name, email } = user;

  if (!email) {
    console.log("⚠️ Este usuario no tiene email, no se envía notificación.");
    return;
  }

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

/**
 * Envía un correo al cliente notificando que su reserva fue confirmada.
 * @param {Object} reservation - Objeto de la reserva.
 */
async function sendReservationConfirmationEmail(reservation) {
  if (!reservation || !reservation.clientEmail) {
    console.log("⚠️ No se puede enviar email: falta información del cliente.");
    return;
  }

  const { clientName, clientEmail, tableNumber, selected_date } = reservation;

  const htmlMessage = `
<div style="background-color:#181818; padding:40px 0; font-family: 'Poppins', Arial, sans-serif; color:#EDEDED;">
  <!-- Importar fuentes -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">

  <div style="max-width:600px; margin:0 auto; background-color:#222; border-radius:14px; overflow:hidden; box-shadow:0 6px 16px rgba(0,0,0,0.35);">

    <!-- Header con logo infinito (idéntico al original) -->
    <div style="background-color:#28a745; padding:20px; text-align:center;">
      <span style="
        display:inline-block;
        color:#f4d35e;
        font-size:80px;
        font-weight:bold;
        vertical-align:middle;
        line-height:1;
      ">∞</span>
      <h1 style="color:#ffffff; margin:10px 0 0; font-size:30px; font-family:'Playfair Display', serif;">Reserva Confirmada</h1>
    </div>

    <!-- Body -->
    <div style="padding:35px 30px; color:#EDEDED;">
      <p style="font-size:17px; margin-bottom:12px;">Hola <strong style="color:#1fd678;">${clientName}</strong>,</p>
      <p style="font-size:16px; line-height:1.7; margin-bottom:25px;">
        ¡Tu reserva en <strong style="color:#fff;">El Bucle</strong> ha sido 
        <span style="color:#1fd678; font-weight:600;">confirmada</span> con éxito!
      </p>

      <div style="background-color:#2a2a2a; border-left:4px solid #1fd678; padding:15px 20px; border-radius:8px; margin-bottom:25px;">
        <ul style="list-style:none; padding:0; margin:0; font-size:15px;">
          <li style="margin-bottom:6px;"><strong style="color:#fff;">Mesa:</strong> ${tableNumber}</li>
          <li><strong style="color:#fff;">Fecha y hora:</strong> ${selected_date}</li>
        </ul>
      </div>

      <p style="font-size:16px; line-height:1.7;">
        Te esperamos para que disfrutes de nuestra experiencia gastronómica.  
        Gracias por confiar en nosotros.
      </p>

      <p style="margin-top:35px; font-size:15px; color:#ccc;">
        Atentamente,<br>
        <strong style="color:#fff;">El equipo de El Bucle</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#1a1a1a; padding:20px; text-align:center; font-size:13px; color:#888;">
      <p style="margin:0;">© ${new Date().getFullYear()} El Bucle. Todos los derechos reservados.</p>
      <p style="margin:6px 0 0;">Este correo fue enviado automáticamente, por favor no lo responda directamente.</p>
    </div>

  </div>
</div>

  `;

  const msg = {
    to: clientEmail,
    from: process.env.EMAIL,
    subject: `Reserva confirmada - Mesa ${tableNumber}`,
    html: htmlMessage,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo de confirmación enviado a ${clientEmail}`);
  } catch (error) {
    console.error(`❌ Error enviando correo a ${clientEmail}:`, error);
  }
}


/**
 * Envía un correo al cliente notificando que su reserva fue rechazada.
 * @param {Object} reservation - Objeto de la reserva.
 * @param {string} rejectReason - Motivo de rechazo de la reserva.
 */
async function sendReservationRejectionEmail(reservation, rejectReason) {
  if (!reservation || !reservation.clientEmail) {
    console.log("⚠️ No se puede enviar email: falta información del cliente.");
    return;
  }

  const { clientName, clientEmail, tableNumber, selected_date } = reservation;

  const htmlMessage = `
<div style="background-color:#1E1C1A; padding:40px 0; font-family: Arial, sans-serif; color:#FFDAB3;">
  <div style="max-width:600px; margin:0 auto; background-color:#2A2725; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.2);">

    <!-- Header con logo infinito -->
    <div style="background-color:#dc3545; padding:20px; text-align:center;">
      <span style="
        display:inline-block;
        color:#f4d35e;
        font-size:80px;
        font-weight:bold;
        vertical-align:middle;
        line-height:1;
      ">∞</span>
      <h1 style="color:#ffffff; margin:10px 0 0; font-size:28px;">Reserva Rechazada</h1>
    </div>

    <!-- Body -->
    <div style="padding:30px; color:#FFDAB3;">
      <p style="font-size:16px;">Hola <strong>${clientName}</strong>,</p>
      <p style="font-size:16px; line-height:1.6;">
        Lamentamos informarte que tu reserva en <strong>El Bucle</strong> ha sido <span style="color:#dc3545; font-weight:bold;">rechazada</span>.
      </p>
      <ul style="list-style:none; padding:0; font-size:16px;">
        <li><strong>Mesa:</strong> ${tableNumber}</li>
        <li><strong>Fecha y hora:</strong> ${selected_date}</li>
        <li><strong>Motivo:</strong> ${rejectReason || "No especificado"}</li>
      </ul>
      <p style="font-size:16px; line-height:1.6;">
        Si tienes dudas o deseas más información, puedes contactarnos respondiendo a este correo.
      </p>
      <p style="margin-top:30px; font-size:15px;">
        Atentamente,<br>
        <strong>El equipo de El Bucle</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#1E1C1A; padding:20px; text-align:center; font-size:13px; color:#777;">
      <p style="margin:0;">© ${new Date().getFullYear()} El Bucle. Todos los derechos reservados.</p>
      <p style="margin:5px 0 0;">Este correo fue enviado automáticamente, por favor no lo responda directamente.</p>
    </div>

  </div>
</div>
  `;

  const msg = {
    to: clientEmail,
    from: process.env.EMAIL,
    subject: `❌ Tu reserva en El Bucle ha sido rechazada - Mesa ${tableNumber}`,
    html: htmlMessage,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo de rechazo enviado a ${clientEmail}`);
  } catch (error) {
    console.error(`❌ Error enviando correo a ${clientEmail}:`, error);
  }
}

// ===============================
// 🔹 FUNCIÓN 1: guardar PDF
// ===============================
async function saveOrderPDF(pdfBase64) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'order.pdf');
    fs.writeFileSync(filePath, Buffer.from(pdfBase64, 'base64'));
    console.log(`✅ PDF guardado en: ${filePath}`);
    return filePath;
  } catch (err) {
    console.error('❌ Error guardando PDF:', err);
    throw new Error('Error guardando PDF');
  }
}

// ===============================
// 🔹 FUNCIÓN 2: enviar correo con PDF adjunto
// ===============================
async function sendOrderEmail(client, pdfBase64) {
  const msg = {
    to: client.email || "matiasezequielsmania@gmail.com",
    from: process.env.EMAIL,
    subject: 'Tu pedido en El Bucle',
    html: `
<div style="background-color:#1E1C1A; padding:40px 0; font-family: Arial, sans-serif; color:#FFDAB3;">
  <div style="max-width:600px; margin:0 auto; background-color:#2A2725; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.2);">

    <!-- Header con logo infinito -->
    <div style="background-color:#d4a017; padding:25px; text-align:center;">
      <span style="
        display:inline-block;
        color:#1E1C1A;
        font-size:80px;
        font-weight:bold;
        vertical-align:middle;
        line-height:1;
      ">∞</span>
      <h1 style="color:#1E1C1A; margin:10px 0 0; font-size:28px; font-weight:700;">Gracias por tu compra</h1>
    </div>

    <!-- Body -->
    <div style="padding:35px; color:#FFDAB3;">
      <p style="font-size:16px;">Hola <strong>${client.firstName || "Mariano Gomez"}</strong>,</p>

      <p style="font-size:16px; line-height:1.6;">
        Queremos agradecerte por tu reciente compra en <strong>El Bucle</strong>.  
        Adjuntamos tu <strong>factura en formato PDF</strong>.
      </p>

      <p style="font-size:16px; line-height:1.6;">
        Esperamos que disfrutes de nuestros productos tanto como nosotros disfrutamos prepararlos.  
        Tu satisfacción es muy importante para nosotros — no dudes en visitarnos nuevamente o seguirnos en redes para conocer nuestras novedades.
      </p>

      <p style="margin-top:30px; font-size:15px;">
        ¡Gracias por ser parte de <strong>El Bucle</strong>!<br>
        <strong>El equipo de El Bucle</strong><br>
        <span style="color:#d4a017;">∞</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#1E1C1A; padding:20px; text-align:center; font-size:13px; color:#999;">
      <p style="margin:0;">© ${new Date().getFullYear()} El Bucle. Todos los derechos reservados.</p>
      <p style="margin:5px 0 0;">Este correo fue enviado automáticamente. Por favor, no responda a este mensaje.</p>
    </div>

  </div>
</div>

    `,
    attachments: [
      {
        content: pdfBase64,
        filename: 'Factura_ElBucle.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo enviado a ${client.email || client}`);
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    throw new Error('Error enviando correo');
  }
}

module.exports = { notifyUserStatus, sendReservationConfirmationEmail, sendReservationRejectionEmail, saveOrderPDF, sendOrderEmail };


