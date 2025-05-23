// test-buy.js
// Script de prueba para enviar 5 mensajes "BUY" con intervalo de 1 segundo
import fetch from 'node-fetch';

// Función para enviar un mensaje BUY a través de HTTP
async function sendBuyMessage(count) {
  try {
    console.log(`[${count}] Enviando mensaje BUY → EXECUTE`);
    
    const response = await fetch('http://localhost:3001/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log(`[${count}] Respuesta recibida:`, data);
    
    return true;
  } catch (error) {
    console.error(`[${count}] Error al enviar mensaje:`, error);
    return false;
  }
}

// Función principal para iniciar la prueba
async function runTest() {
  console.log('Iniciando prueba: Enviando 5 mensajes "BUY" (1 por segundo)');
  
  // Enviar 5 mensajes con intervalo de 1 segundo
  for (let i = 1; i <= 5; i++) {
    const success = await sendBuyMessage(i);
    
    // Si hubo un error, detenemos la prueba
    if (!success) {
      console.error('Prueba interrumpida debido a errores.');
      process.exit(1);
    }
    
    // Esperar 1 segundo antes del próximo mensaje (excepto el último)
    if (i < 5) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('Prueba completada. 5 mensajes "BUY" enviados.');
  process.exit(0);
}

// Ejecutar la prueba
runTest();
