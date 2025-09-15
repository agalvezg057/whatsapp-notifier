const express = require('express');
const cors = require('cors');
const { create } = require('@wppconnect-team/wppconnect');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

let client;

async function startWhatsAppClient() {
    client = await create({
        session: 'whatsapp-session', // sesión temporal, no persistida
        puppeteerOptions: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // evita problemas de memoria compartida
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--mute-audio'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH // opcional si necesitas path específico
        },
        listeners: {
            onQrCode: (base64Qr, asciiQR) => {
                console.log('Escanea este QR con tu teléfono:');
                qrcode.generate(asciiQR, { small: true });
            },
            onReady: () => console.log('Cliente WhatsApp listo 🚀'),
            onStateChange: (state) => console.log('Estado de conexión:', state),
        },
    });
}

// Inicializa cliente al arrancar el servidor
startWhatsAppClient();

// Endpoint para enviar mensajes
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!client) {
        return res.status(503).json({ status: 'error', message: 'Cliente no inicializado' });
    }

    try {
        await client.sendText(`${phone}@c.us`, message);
        console.log(`Mensaje enviado a ${phone}: ${message}`);
        res.json({ status: 'ok', message: 'Mensaje enviado exitosamente' });
    } catch (error) {
        console.error(`Error al enviar mensaje a ${phone}:`, error);
        res.status(500).json({ status: 'error', message: 'Error al enviar el mensaje', error: error.message });
    }
});

// Arranque del servidor
app.listen(3000, () => console.log('Servidor WhatsApp corriendo en puerto 3000'));
