// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import admin from 'firebase-admin';
// import { createClient } from '@supabase/supabase-js';
// import { notifyUserStatus } from './mailer.js';
// import fs from 'fs';
// const admin = require('firebase-admin');

// // Inicializar Firebase Admin
// // const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));
// // admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount)
// // });

// // Inicializar Supabase
// // const supabase = createClient('https://dgnvjlzhaoxhaftpdurq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbnZqbHpoYW94aGFmdHBkdXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUxNTEsImV4cCI6MjA2MDEzMTE1MX0.yjRBf1UdsEqWm8YBbB7NSXYtVqgLV_J65TTDvR_DWsQ');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());


// // Carga el archivo JSON de configuración que descargaste desde Firebase
// const serviceAccount = require('./serviceAccountKey.json'); // Reemplaza con la ruta de tu archivo

// // Inicializa Firebase Admin
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// // Endpoint para enviar el mail de confirmación de registro
// app.post('/send-confirmation-mail', async (req, res) => {
//     console.log(req.body);
//     const { name, email, statusString } = req.body;
//     if (!name || !email) return res.status(400).send('Faltan parámetros');

//     const user = { name, email };

//     // Enviar correo de confirmación
//     notifyUserStatus(user, statusString);

//     res.send({ success: true, message: 'Correo enviado' });
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { notifyUserStatus } from './mailer.js';
import fs from 'fs';

// Si estás utilizando ESModules, deberías usar 'import'. 
// Si no, asegúrate de que tu 'package.json' tenga "type": "module".

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Cargar el archivo JSON de configuración de Firebase
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Inicializar Supabase
const supabase = createClient(
    'https://dgnvjlzhaoxhaftpdurq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbnZqbHpoYW94aGFmdHBkdXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUxNTEsImV4cCI6MjA2MDEzMTE1MX0.yjRBf1UdsEqWm8YBbB7NSXYtVqgLV_J65TTDvR_DWsQ'
);

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
