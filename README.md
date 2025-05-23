# ZeroMQ Bridge Demo - Trading Ultrarrápido

## Descripción General

Este proyecto implementa una demostración de trading ultrarrápido que conecta una interfaz web con MetaTrader 5 utilizando ZeroMQ para comunicaciones TCP de baja latencia. El objetivo principal es mostrar cómo se puede lograr una comunicación casi instantánea entre una aplicación web y la plataforma de trading MetaTrader 5, permitiendo la ejecución de órdenes con latencias mínimas.

## Objetivos del Proyecto

- **Demostrar comunicación de baja latencia**: Mostrar cómo implementar un sistema de comunicación rápido entre una interfaz web y MetaTrader 5.
- **Simplificar la arquitectura**: Evitar infraestructuras complejas y dependencias innecesarias.
- **Proporcionar una base educativa**: Servir como punto de partida para sistemas de trading más complejos.
- **Ilustrar el patrón PUB/SUB**: Demostrar el uso práctico del patrón de mensajería Publisher/Subscriber.

## Arquitectura Detallada

![Arquitectura](https://i.imgur.com/F4wYVK2.png)

El sistema consta de tres componentes principales que trabajan juntos para lograr una comunicación ultrarrápida:

### 1. Frontend Web (Cliente)

**Tecnologías**: HTML5, JavaScript, CSS

**Funciones**:
- Proporciona una interfaz de usuario simple con un botón "COMPRAR"
- Envía peticiones HTTP POST al servidor bridge
- Muestra feedback visual y métricas de latencia en tiempo real

### 2. Bridge HTTP → ZeroMQ (Servidor)

**Tecnologías**: Node.js, Express, ZeroMQ (zeromq)

**Funciones**:
- Recibe peticiones HTTP desde el frontend
- Transforma inmediatamente estas peticiones en mensajes ZeroMQ
- Publica mensajes con el tópico "BUY" a través del protocolo TCP
- Proporciona feedback al cliente web

### 3. Expert Advisor (EA) en MetaTrader 5

**Tecnologías**: MQL5, ZeroMQ wrapper para MQL5

**Funciones**:
- Mantiene un socket ZeroMQ en modo SUB (Subscriber)
- Escucha mensajes con el tópico "BUY" en `tcp://127.0.0.1:5555`
- Procesa los mensajes recibidos y ejecuta órdenes de compra en MetaTrader 5
- Aplica parámetros preconfigurados (stop loss, take profit, tamaño de lote)

## Flujo de Datos

1. **Usuario → Frontend**: El usuario hace clic en el botón "COMPRAR" en la interfaz web
2. **Frontend → Bridge**: Se envía una petición HTTP POST a `/buy`
3. **Bridge → ZeroMQ**: El servidor transforma la petición en un mensaje ZeroMQ con formato `['BUY', 'EXECUTE']`
4. **ZeroMQ → EA**: El mensaje viaja por TCP local al EA que está suscrito al tópico "BUY"
5. **EA → MetaTrader 5**: El EA procesa el mensaje y ejecuta una orden de compra en la plataforma

## Ventajas Técnicas

- **Latencia ultrabaja**: La comunicación a través de TCP local con ZeroMQ es del orden de milisegundos
- **Desacoplamiento**: Cada componente puede evolucionar independientemente
- **Escalabilidad**: El patrón PUB/SUB permite añadir más suscriptores sin modificar el publicador
- **Robustez**: ZeroMQ maneja automáticamente reconexiones y buffers de mensajes

## Dependencias

### Dependencias del Servidor

- **Node.js** (v14+): Entorno de ejecución JavaScript
- **Express** (v4.18.2+): Framework web para Node.js
- **ZeroMQ** (v6.0.0-beta.16+): Biblioteca de mensajería de alto rendimiento

### Dependencias del Cliente

- **Navegador moderno**: Con soporte para JavaScript ES6+

### Dependencias del Expert Advisor

- **MetaTrader 5**: Plataforma de trading
- **ZeroMQ para MQL5**: Wrapper de ZeroMQ para el lenguaje MQL5

## Instalación y Configuración

### Instalación del Servidor

```bash
# Clonar el repositorio (o descargar)
git clone <url-del-repositorio>
cd zmq-bridge-demo

# Instalar dependencias
npm install
```

### Configuración del Expert Advisor

Para que esta demo funcione, necesitas configurar un Expert Advisor en MetaTrader 5 que:

1. Establezca una conexión ZeroMQ SUB a `tcp://127.0.0.1:5555`
2. Se suscriba al tópico "BUY"
3. Procese los mensajes recibidos y ejecute órdenes en MT5

#### Ejemplo de código MQL5 para el EA (fragmento)

```cpp
// En OnInit()
context = zmq_ctx_new();
subscriber = zmq_socket(context, ZMQ_SUB);
zmq_connect(subscriber, "tcp://127.0.0.1:5555");
zmq_setsockopt(subscriber, ZMQ_SUBSCRIBE, "BUY", 3);

// En OnTick() o en un timer
zmq_msg_t topic;
zmq_msg_t message;
zmq_msg_init(&topic);
zmq_msg_init(&message);

int recv_topic = zmq_msg_recv(&topic, subscriber, ZMQ_DONTWAIT);
if (recv_topic > 0) {
    zmq_msg_recv(&message, subscriber, 0);
    string msg = zmq_msg_data(&message);
    if (msg == "EXECUTE") {
        // Ejecutar orden de compra
        OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0, "ZMQ Order", 0, 0, Green);
    }
    zmq_msg_close(&message);
    zmq_msg_close(&topic);
}
```

## Ejecución

```bash
# Iniciar el servidor
node server.js
# O usando npm
npm start
```

O bien, puedes usar VS Code:
- Para depurar: Presiona F5
- Para iniciar: Ejecuta la tarea "npm: start"

## Uso Paso a Paso

1. **Inicia el servidor bridge**:
   ```bash
   node server.js
   ```

2. **Verifica que el servidor esté funcionando**:
   Deberías ver en la consola:
   ```
   ZeroMQ PUB escuchando en tcp://0.0.0.0:5555
   HTTP Server en http://localhost:3001
   ```

3. **Inicia MetaTrader 5 y activa tu Expert Advisor**:
   Asegúrate de que esté configurado para conectarse a `tcp://127.0.0.1:5555`

4. **Abre la interfaz web**:
   Navega a `http://localhost:3001` en tu navegador

5. **Ejecuta una orden**:
   Haz clic en el botón "COMPRAR"

6. **Observa los resultados**:
   - En la interfaz web: Verás la confirmación y la latencia
   - En la consola del servidor: Verás "Publicado BUY → EXECUTE"
   - En MetaTrader 5: Verás la ejecución de la orden

## Estructura del Proyecto

```
zmq-bridge-demo/
│
├── public/              # Archivos estáticos de la demo web
│   └── index.html       # Interfaz de usuario simplificada
│
├── server.js            # Bridge HTTP → ZeroMQ
├── package.json         # Configuración npm y dependencias
├── package-lock.json    # Versiones exactas de dependencias
├── README.md            # Documentación del proyecto
└── .vscode/             # Configuración VS Code
    ├── launch.json      # Configuración de depuración
    └── tasks.json       # Configuración de tareas
```

## Capacidades y Limitaciones

### Capacidades

- **Comunicación ultrarrápida**: Latencias típicas por debajo de 10ms en entornos locales
- **Simplicidad**: Arquitectura minimalista y fácil de entender
- **Extensibilidad**: Base sólida para añadir funcionalidades adicionales
- **Robustez**: Manejo de errores y reconexiones automáticas

### Limitaciones

- **Solo entorno local**: Diseñado para funcionar en la misma máquina que MetaTrader 5
- **Funcionalidad básica**: Solo implementa órdenes de compra simples
- **Sin autenticación**: La versión básica no incluye mecanismos de seguridad

## Posibles Extensiones

- **Añadir autenticación**: Implementar un sistema de API keys
- **Soporte para más operaciones**: Venta, modificación de órdenes, cierre de posiciones
- **Panel de control**: Interfaz más completa con estado de órdenes y posiciones
- **Publicación en Internet**: Usando túneles seguros como ngrok o Cloudflare Tunnel

## Notas Técnicas Adicionales

- **Patrón PUB/SUB**: ZeroMQ implementa un sistema de mensajería donde los publicadores no necesitan conocer a los suscriptores
- **Multipart Messages**: ZeroMQ permite enviar mensajes en partes, usando la primera como tópico
- **Comunicación asíncrona**: El sistema no bloquea mientras espera respuestas
- **Rendimiento**: ZeroMQ está optimizado para alto rendimiento y baja latencia
