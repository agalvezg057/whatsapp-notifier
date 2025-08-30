const express = require('express');
const cors = require('cors');
const { create } = require('@wppconnect-team/wppconnect');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let client;

// Define la ruta de la carpeta de sesión para evitar ambigüedades
const sessionPath = path.resolve(__dirname, 'sessions');

// Función para limpiar el archivo de bloqueo
const clearLockFile = () => {
    const lockFilePath = path.join(sessionPath, 'barber-session', '.lock');
    if (fs.existsSync(lockFilePath)) {
        console.log('Archivo de bloqueo encontrado, eliminando...');
        fs.unlinkSync(lockFilePath);
    }
};

async function startWhatsAppClient() {
    // ⭐️ Paso 1: Limpiar cualquier archivo de bloqueo de una sesión anterior.
    clearLockFile();

    // ⭐️ Paso 2: Asegurarse de que la carpeta de sesión existe.
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath);
        console.log('Directorio de sesión creado.');
    }

    client = await create({
        // El nombre de la sesión
        session: 'barber-session',
        // Ruta base donde se guardarán las sesiones
        folderNameToken: sessionPath,
        puppeteerOptions: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        listeners: {
            onQrCode: (base64Qr, asciiQR, attempts, url) => {
                console.log('Código QR recibido. Escanearlo con su teléfono:');
                qrcode.generate(asciiQR, { small: true });
            },
            onReady: () => {
                console.log('¡El cliente está listo!');
            },
            onStateChange: (state) => {
                console.log('Estado de la conexión:', state);
            },
        },
    });
}

// Inicializar el cliente cuando el servidor arranque
startWhatsAppClient();

// Endpoint para enviar mensajes
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;
    
    if (!client) {
        return res.status(503).json({ status: 'error', message: 'El cliente de WhatsApp no está inicializado.' });
    }

    try {
        await client.sendText(`${phone}@c.us`, message);
        console.log(`Mensaje enviado a ${phone}: ${message}`);
        res.json({ status: 'ok', message: 'Mensaje enviado exitosamente.' });
    } catch (error) {
        console.error(`Error al enviar mensaje a ${phone}:`, error);
        res.status(500).json({ status: 'error', message: 'Error al enviar el mensaje.', error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor WhatsApp corriendo en puerto 3000');
});