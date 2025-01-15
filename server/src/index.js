require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');

const app = express();

//Conectar a MongoDB
connectDB();
app.use(cors());
app.use(bodyParser.json());

//Rutas 
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));