import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { notifyUserStatus } from './mailer.js';
import fs from 'fs';

// Inicializar Firebase Admin
// const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// Inicializar Supabase
// const supabase = createClient('https://dgnvjlzhaoxhaftpdurq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbnZqbHpoYW94aGFmdHBkdXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUxNTEsImV4cCI6MjA2MDEzMTE1MX0.yjRBf1UdsEqWm8YBbB7NSXYtVqgLV_J65TTDvR_DWsQ');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// // Endpoint para enviar push notifications
// app.post('/send-notification', async (req, res) => {
//     const { userId, title, body } = req.body;

//     if (!userId || !title || !body) return res.status(400).send('Faltan parámetros');

//     // Buscar tokens del usuario en Supabase
//     const { data: tokens, error } = await supabase
//         .from('user_tokens')
//         .select('device_token')
//         .eq('user_id', userId);

//     if (error) return res.status(500).send(error.message);
//     if (!tokens?.length) return res.status(404).send('No se encontraron tokens');

//     // Enviar notificación a cada token
//     const promises = tokens.map(t => {
//         return admin.messaging().send({
//             notification: { title, body },
//             token: t.device_token,
//         });
//     });

//     try {
//         await Promise.all(promises);
//         res.send({ success: true, message: 'Notificación enviada' });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// Endpoint para enviar el mail de confirmación de registro
app.post('/send-confirmation-mail', async (req, res) => {
    console.log(req.body);
    const { name, email, statusString } = req.body;
    if (!name || !email) return res.status(400).send('Faltan parámetros');

    const user = { name, email };

    // Enviar correo de confirmación
    notifyUserStatus(user, statusString);

    res.send({ success: true, message: 'Correo enviado' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
