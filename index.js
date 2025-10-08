

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { notifyUserStatus } from './mailer.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// const corsOptions = {
//     origin: ['capacitor://localhost', 'http://localhost:4200', 'https://localhost'], // incluye tus orígenes reales
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// };

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
// Usa CORS globalmente
app.use(cors(corsOptions));

app.use(bodyParser.json());

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.GOOGLE_PROJECT_ID,
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        // Reemplazamos los \n literales por saltos de línea reales
        privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),

    }),
});
// Inicializar Supabase
const supabase = createClient(
    'https://dgnvjlzhaoxhaftpdurq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbnZqbHpoYW94aGFmdHBkdXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUxNTEsImV4cCI6MjA2MDEzMTE1MX0.yjRBf1UdsEqWm8YBbB7NSXYtVqgLV_J65TTDvR_DWsQ'
);


app.post('/register-device', async (req, res) => {
    const { token, userId } = req.body;

    console.log(token, userId);

    if (!token || !userId) {
        return res.status(400).send('Faltan parámetros');
    }

    // Guardar el token en la base de datos (en este caso usando Supabase como ejemplo)
    const { data, error } = await supabase
        .from('user_tokens')
        .upsert([{ user_id: userId, device_token: token }]);

    if (error) {
        return res.status(500).send('Error al guardar el token');
    }

    res.send({ success: true, message: 'Token registrado' });
});

// Endpoint para enviar la notificación push
app.post('/send-push-notification', async (req, res) => {
    const { userId, title, message } = req.body;

    console.log(userId, title, message);
    if (!userId || !title || !message) {
        return res.status(400).send('Faltan parámetros');
    }

    // Obtener todos los tokens del usuario desde Supabase
    const { data, error } = await supabase
        .from('user_tokens')
        .select('device_token')
        .eq('user_id', userId);

    if (error || !data || data.length === 0) {
        console.log('❌ Token no encontrado');
        console.log(error);
        return res.status(404).send('Token no encontrado');
    }

    try {
        // Enviar a cada token del usuario
        for (const row of data) {
            const token = row.device_token;

            const notificationPayload = {
                token,
                notification: {
                    title,
                    body: message,
                },
                android: {
                    notification: {
                        channelId: 'default',
                        priority: 'high',
                        sound: 'default',
                    },
                    priority: 'high',
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            };


            const response = await admin.messaging().send(notificationPayload);
            console.log('✅ Notificación enviada a', token, response);
        }

        res.send({ success: true, message: 'Notificaciones enviadas' });
    } catch (err) {
        console.error('❌ Error al enviar notificaciones:', err);
        res.status(500).send('Error al enviar la notificación');
    }
});


// Endpoint para enviar el mail de confirmación de registro
app.post('/send-confirmation-mail', async (req, res) => {
    const { name, email, statusString } = req.body;

    // Validar parámetros
    if (!name || !email) {
        return res.status(400).send('Faltan parámetros');
    }

    const user = { name, email };

    // Enviar correo de confirmación
    try {
        await notifyUserStatus(user, statusString);
        res.send({ success: true, message: 'Correo enviado' });
    } catch (error) {
        console.error('Error enviando correo:', error);
        res.status(500).send('Error al enviar el correo');
    }
});

// Configurar el puerto y levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
