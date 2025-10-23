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
<div style="background-color:#1E1C1A; padding:40px 0; font-family: Arial, sans-serif; color:#FFDAB3;">
  <div style="max-width:600px; margin:0 auto; background-color:#2A2725; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.2);">

    <!-- Header con logo infinito -->
    <div style="background-color:#28a745; padding:20px; text-align:center;">
      <span style="
        display:inline-block;
        color:#f4d35e;
        font-size:80px;
        font-weight:bold;
        vertical-align:middle;
        line-height:1;
      ">∞</span>
      <h1 style="color:#ffffff; margin:10px 0 0; font-size:28px;">Reserva Confirmada</h1>
    </div>

    <!-- Body -->
    <div style="padding:30px; color:#FFDAB3;">
      <p style="font-size:16px;">Hola <strong>${clientName}</strong>,</p>
      <p style="font-size:16px; line-height:1.6;">
        ¡Tu reserva en <strong>El Bucle</strong> ha sido <span style="color:#28a745; font-weight:bold;">confirmada</span> con éxito!
      </p>
      <ul style="list-style:none; padding:0; font-size:16px;">
        <li><strong>Mesa:</strong> ${tableNumber}</li>
        <li><strong>Fecha y hora:</strong> ${selected_date}</li>
      </ul>
      <p style="font-size:16px; line-height:1.6;">
        Te esperamos para que disfrutes de nuestra experiencia. Gracias por confiar en nosotros.
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


module.exports = { notifyUserStatus, sendReservationConfirmationEmail, sendReservationRejectionEmail };


