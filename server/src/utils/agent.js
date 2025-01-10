const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { Product } = require("../models/Product");

const chat = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 100,
});

// async function retrieveProducts(query) {
//   try {
//     return await Product.find({
//       $or: [
//         { nombre: { $regex: query, $options: "i" } },
//         { descripcion: { $regex: query, $options: "i" } },
//         { categoria: { $regex: query, $options: "i" } },
//         { ingredientes: { $regex: query, $options: "i" } },
//       ],
//       disponible: true,
//     });
//   } catch (error) {
//     console.error("Error al buscar productos:", error);
//     return [];
//   }
// }

const template = `
Eres un asistente amable de un restaurante de sushi. 

Mensaje del cliente: {message}

Proporciona una respuesta útil sobre nuestros productos de sushi, ayudando al cliente a hacer su pedido.
Si no hay productos relevantes para la consulta, ofrece recomendaciones generales del menú.
`;

const prompt = PromptTemplate.fromTemplate(template);

const chatAgent = new RunnableSequence({
  steps: [
    async (input) => {
      // Paso inicial: Devolver solo el mensaje
      return { message: input.message };
    },
    prompt, // Paso 2: Formatear el mensaje con la plantilla
    chat,   // Paso 3: Generar respuesta usando el modelo de lenguaje
    new StringOutputParser(), // Paso 4: Formatear la salida como texto
  ],
});
console.log(chatAgent);

module.exports = { chatAgent };
