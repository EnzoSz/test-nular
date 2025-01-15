# Chatbot Restaurante de Sushi 🍣

Un chatbot inteligente para un restaurante de sushi que utiliza GPT-4 y procesamiento de lenguaje natural para atender pedidos y responder consultas sobre el menú.

## Características 🌟

- Responde consultas sobre el menú
- Procesa pedidos automáticamente
- Almacena pedidos en MongoDB
- Utiliza RAG (Retrieval Augmented Generation) para contextualizar respuestas
- Interfaz de chat en tiempo real

## Instalación 🚀

### Prerrequisitos

- Node.js (v14 o superior)
- MongoDB
- NPM o Yarn

### Configuración del Proyecto

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
```

2. Configurar el Backend (server):
```bash
cd server
npm install
```
3. Configurar Docker
### Prerrequisitos
- Docker
- Docker Compose
- Node.js (para ejecutar los seeders)

### Pasos para Despliegue:
1. Crear archivo .env en /server:
```env
MONGO_URI=mongodb://localhost:27017/sushi-restaurant
OPENAI_API_KEY=tu-api-key-de-openai
PORT=3000
```
2. Construir las imágenes:
```bash
docker-compose build
```

3. Iniciar los contenedores en modo detach (background):
```bash
docker-compose up -d
```

4. Verificar que los contenedores estén corriendo:
```bash
docker-compose ps
```


5. Cargar datos de ejemplo:
```bash
npm run seed
```

6. Iniciar el servidor:
```bash
npm run dev
```

7. Configurar el Frontend (client):
```bash
cd ../client
npm install
npm run dev
```

## Uso del Chatbot 💬

### Ejemplos de Mensajes

1. Consultas generales:
```
- "¿Qué rolls tienen disponibles?"
- "¿Cuál es el precio del California Roll?"
- "¿Tienen opciones vegetarianas?"
```

2. Hacer pedidos:
```
- "Quiero ordenar 2 California Roll y 1 Dragon Roll"
- "Nombre: Juan, Pedido: 3 Spicy Tuna Roll"
```

3. Formato recomendado para pedidos:
```
Nombre: [nombre]
Pedido: [cantidad] [producto], [cantidad] [producto]

Ejemplo:
Nombre: María
Pedido: 2 California Roll, 3 Dragon Roll
```

## API Endpoints 🛣️

### POST /api/chat
Procesa mensajes del usuario y retorna respuestas del chatbot.

Request:
```json
{
  "message": "string"
}
```

Response:
```json
{
  "response": "string"
}
```

## Base de Datos 📊

### Colecciones

1. Products
```javascript
{
  nombre: String,
  descripcion: String,
  precio: Number,
  categoria: String,
  ingredientes: [String],
  disponible: Boolean
}
```

2. Orders
```javascript
{
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String,
  customerName: String,
  createdAt: Date
}
```

### Datos de Ejemplo

Los datos de ejemplo incluyen:

```javascript
[
  {
    nombre: "California Roll",
    descripcion: "Roll de sushi con aguacate, pepino y cangrejo",
    precio: 12.99,
    categoria: "Rolls Clásicos",
    ingredientes: ["Aguacate", "Pepino", "Cangrejo", "Arroz", "Alga nori"],
    disponible: true
  },
  {
    nombre: "Spicy Tuna Roll",
    descripcion: "Roll picante con atún fresco y verduras",
    precio: 14.99,
    categoria: "Rolls Especiales",
    ingredientes: ["Atún", "Sriracha", "Cebollín", "Arroz", "Alga nori"],
    disponible: true
  },
  // ... más productos
]
```

## Estructura del Proyecto 📁

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal del chat
│   │   └── App.css        # Estilos del chat
│   ├── index.html
│   ├── package.json
│   └── vite.config.js     # Configuración de Vite
│
└── server/                 # Backend Node.js
    ├── src/
    │   ├── controllers/   
    │   │   └── chat.controllers.js  # Controlador del chat
    │   ├── models/
    │   │   ├── Order.js   # Modelo de pedidos
    │   │   └── Product.js # Modelo de productos
    │   ├── routes/
    │   │   └── chat.routes.js  # Rutas de la API
    │   ├── seeders/
    │   │   └── seeders.js   # Seeders para cargar datos de ejemplo (se ejecuta con npm run seed)
    │   ├── utils/
    │   │   └── agent.js   # Lógica del chatbot
    │   └── index.js       # Entrada principal
    ├── .env
    └── package.json
```

## Tecnologías Utilizadas 🛠️

### Frontend
- React 18
- Vite
- CSS puro para estilos

### Backend
- Node.js
- Express
- MongoDB con Mongoose
- LangChain
- OpenAI GPT-4

### Características del Chatbot
- RAG (Retrieval Augmented Generation)
- Memory Vector Store para búsqueda semántica
- Procesamiento de lenguaje natural
- Manejo de conversaciones con memoria
- Sistema de pedidos automatizado

## Notas de Desarrollo 📝

1. El chatbot utiliza RAG para proporcionar respuestas contextualizadas sobre los productos disponibles.

2. La interfaz del chat incluye:
   - Mensajes del usuario y bot diferenciados
   - Indicador de escritura
   - Auto-scroll a nuevos mensajes
   - Manejo de errores

3. El sistema de pedidos:
   - Valida productos existentes
   - Calcula totales automáticamente
   - Almacena historial en MongoDB
   - Confirma pedidos con resumen detallado

4. Seguridad:
   - Variables de entorno para configuraciones sensibles
   - Validación de entrada de usuarios
   - Manejo de errores robusto

## Contribuir 🤝

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request



