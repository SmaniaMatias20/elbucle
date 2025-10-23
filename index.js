

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { notifyUserStatus, sendReservationConfirmationEmail, sendReservationRejectionEmail } from './mailer.js';
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
    origin: ['capacitor://localhost', 'http://localhost:4200', 'https://localhost', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
// Usa CORS globalmente
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/public', express.static('public'));

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

app.post('/send-push-notification-waitress', async (req, res) => {
    const { title, message, userIds } = req.body;

    console.log('📣 Enviando notificación a mozos:', { title, message, userIds });

    if (!title || !message) {
        return res.status(400).send('Faltan parámetros');
    }

    try {
        let targetUserIds = [];

        // Si el frontend no envía los IDs, obtenerlos desde Supabase
        if (!userIds || userIds.length === 0) {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'mozo');

            if (userError) {
                console.error('❌ Error obteniendo mozos:', userError);
                return res.status(500).send('Error obteniendo mozos');
            }

            targetUserIds = users.map(u => u.id);
        } else {
            targetUserIds = userIds;
        }

        if (targetUserIds.length === 0) {
            return res.status(404).send('No se encontraron mozos');
        }

        // Obtener todos los tokens de los mozos
        const { data: tokensData, error: tokensError } = await supabase
            .from('user_tokens')
            .select('device_token')
            .in('user_id', targetUserIds);

        if (tokensError) {
            console.error('❌ Error obteniendo tokens:', tokensError);
            return res.status(500).send('Error obteniendo tokens');
        }

        if (!tokensData || tokensData.length === 0) {
            console.log('⚠️ No se encontraron tokens de mozos');
            return res.status(404).send('No se encontraron tokens de mozos');
        }

        // Enviar notificación a cada token
        for (const row of tokensData) {
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

            try {
                const response = await admin.messaging().send(notificationPayload);
                console.log('✅ Notificación enviada a mozo con token:', token, response);
            } catch (sendErr) {
                console.error('❌ Error enviando a token específico:', token, sendErr);
            }
        }

        res.send({ success: true, message: 'Notificaciones enviadas a todos los mozos' });

    } catch (err) {
        console.error('❌ Error general al enviar notificaciones a mozos:', err);
        res.status(500).send('Error al enviar las notificaciones a mozos');
    }
});


app.post('/send-push-notification-maitre', async (req, res) => {
    const { title, message, userIds } = req.body;
    console.log('📣 Enviando notificación a maitres:', { title, message, userIds });
    if (!title || !message) {
        return res.status(400).send('Faltan parámetros');
    }
    try {
        let targetUserIds = [];
        // Si el frontend no envía los IDs, obtenerlos desde Supabase
        if (!userIds || userIds.length === 0) {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'maitre');
            if (userError) {
                console.error('❌ Error obteniendo maitres:', userError);
                return res.status(500).send('Error obteniendo maitres');
            }
            targetUserIds = users.map(u => u.id);
        } else {
            targetUserIds = userIds;
        }
        if (targetUserIds.length === 0) {
            return res.status(404).send('No se encontraron maitres');
        }
        // Obtener todos los tokens de los maitres
        const { data: tokensData, error: tokensError } = await supabase
            .from('user_tokens')
            .select('device_token')
            .in('user_id', targetUserIds);
        if (tokensError) {
            console.error('❌ Error obteniendo tokens:', tokensError);
            return res.status(500).send('Error obteniendo tokens');
        }
        if (!tokensData || tokensData.length === 0) {
            console.log('⚠️ No se encontraron tokens de maitres');
            return res.status(404).send('No se encontraron tokens de maitres');
        }
        // Enviar notificación a cada token
        for (const row of tokensData) {
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
            try {
                const response = await admin.messaging().send(notificationPayload);
                console.log('✅ Notificación enviada a maitre con token:', token, response);
            } catch (sendErr) {
                console.error('❌ Error enviando a token específico:', token, sendErr);
            }
        }
        res.send({ success: true, message: 'Notificaciones enviadas a todos los maitres' });
    } catch (err) {
        console.error('❌ Error general al enviar notificaciones a maitres:', err);
        res.status(500).send('Error al enviar las notificaciones a maitres');
    }
});


app.post('/send-push-notification-owner-and-supervisor', async (req, res) => {
    const { title, message, userIds } = req.body;
    console.log('📣 Enviando notificación a owner y supervisor:', { title, message, userIds });
    if (!title || !message) {
        return res.status(400).send('Faltan parámetros');
    }
    try {
        let targetUserIds = [];
        // Si el frontend no envía los IDs, obtenerlos desde Supabase
        if (!userIds || userIds.length === 0) {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'owner')
                .or('role', 'supervisor');
            if (userError) {
                console.error('❌ Error obteniendo owner y supervisor:', userError);
                return res.status(500).send('Error obteniendo owner y supervisor');
            }
            targetUserIds = users.map(u => u.id);
        } else {
            targetUserIds = userIds;
        }
        if (targetUserIds.length === 0) {
            return res.status(404).send('No se encontraron owner y supervisor');
        }
        // Obtener todos los tokens de los owner y supervisor
        const { data: tokensData, error: tokensError } = await supabase
            .from('user_tokens')
            .select('device_token')
            .in('user_id', targetUserIds);
        if (tokensError) {
            console.error('❌ Error obteniendo tokens:', tokensError);
            return res.status(500).send('Error obteniendo tokens');
        }
        if (!tokensData || tokensData.length === 0) {
            console.log('⚠️ No se encontraron tokens de owner y supervisor');
            return res.status(404).send('No se encontraron tokens de owner y supervisor');
        }
        // Enviar notificación a cada token
        for (const row of tokensData) {
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
            try {
                const response = await admin.messaging().send(notificationPayload);
                console.log('✅ Notificación enviada a owner y supervisor con token:', token, response);
            } catch (sendErr) {
                console.error('❌ Error enviando a token específico:', token, sendErr);
            }
        }
        res.send({ success: true, message: 'Notificaciones enviadas a todos los owner y supervisor' });
    } catch (err) {
        console.error('❌ Error general al enviar notificaciones a owner y supervisor:', err);
        res.status(500).send('Error al enviar las notificaciones a owner y supervisor');
    }
});


// Endpoint para enviar el mail de confirmación de registro
app.post('/send-confirmation-mail', async (req, res) => {
    const { name, email, statusString } = req.body;

    console.log(req.body);

    // Validar parámetros
    if (!name || !email) {
        return res.status(400).send('Faltan parámetros');
    }

    const user = { name, email };

    // Enviar correo de confirmación
    try {
        await notifyUserStatus(user, statusString);
        res.send({ success: true, message: 'Correo enviado' });
        console.log('Correo enviado');
    } catch (error) {
        console.error('Error enviando correo:', error);
        res.status(500).send('Error al enviar el correo');
    }
});

app.post('/confirm-reservation', async (req, res) => {
    const { reservation } = req.body;

    if (!reservation) {
        return res.status(400).send('Faltan parámetros');
    }

    console.log('Reserva recibida en backend:', reservation);

    await sendReservationConfirmationEmail(reservation);

    res.status(200).send({ message: 'Reserva confirmada correctamente' });
});


app.post('/reject-reservation', async (req, res) => {
    const { reservation, rejectReason } = req.body;

    if (!reservation) {
        return res.status(400).send('Faltan parámetros');
    }

    console.log('Reserva rechazada en backend:', reservation);

    await sendReservationRejectionEmail(reservation, rejectReason);

    res.status(200).send({ message: 'Reserva rechazada correctamente' });
});


// Configurar el puerto y levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
