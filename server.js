// server.js
import express from 'express';
import { Publisher } from 'zeromq';

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 1️⃣ Creamos el publisher ZeroMQ
const pub = new Publisher();

// Función asincrónica para iniciar el servidor
async function startServer() {
  try {
    // Bind ZeroMQ publisher
    await pub.bind('tcp://0.0.0.0:5555');
    console.log('ZeroMQ PUB escuchando en tcp://0.0.0.0:5555');

    // 2️⃣ Endpoint HTTP para la orden de compra
    app.post('/buy', (req, res) => {
      // Obtenemos los parámetros de la orden del cuerpo de la solicitud
      const orderParams = req.body;
      
      // Convertimos los parámetros a JSON para enviarlos por ZeroMQ
      const orderParamsJSON = JSON.stringify(orderParams);
      
      // Enviamos el comando BUY con los parámetros
      pub.send(['BUY', orderParamsJSON]);
      
      console.log('Publicado BUY →', orderParams);
      
      // Respondemos con estado OK y timestamp
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        orderReceived: orderParams 
      });
    });

    // 3️⃣ Arrancamos el servidor HTTP
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`HTTP Server en http://localhost:${PORT}`);
      console.log(`Abre http://localhost:${PORT} en tu navegador para probar la demo`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciamos el servidor
startServer();
