const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { Product } = require("../models/Product");
const { ConversationalRetrievalQAChain } = require("langchain/chains");
// const { MongoDBChatMessageHistory } = require("@langchain/mongodb");
const { BufferMemory } = require("langchain/memory");

const chat = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 500,
});

// Función para recuperar productos
async function retrieveProducts(query) {
  try {
    return await Product.find({
      $or: [
        { nombre: { $regex: query, $options: "i" } },
        { descripcion: { $regex: query, $options: "i" } },
        { categoria: { $regex: query, $options: "i" } },
        { ingredientes: { $regex: query, $options: "i" } },
      ],
      disponible: true,
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return [];
  }
}

const template = `
Eres un asistente amable de un restaurante de sushi.

Contexto de productos disponibles: {context}
Historial de conversación: {chat_history}
Mensaje actual del cliente: {message}

Proporciona una respuesta útil sobre nuestros productos de sushi, ayudando al cliente a hacer su pedido.
Si no hay productos relevantes para la consulta, ofrece recomendaciones generales del menú.
Usa la información de los productos disponibles para dar respuestas precisas.
`;

const prompt = PromptTemplate.fromTemplate(template);

// Configuración de la memoria para el historial de chat
const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const createChatAgent = async () => {
  // Función para procesar mensajes
  const processMessage = async (message) => {
    try {
      // Buscar productos relevantes
      const products = await retrieveProducts(message);
      const context = products.length > 0 
        ? products.map(p => `${p.nombre}: ${p.descripcion} - Precio: ${p.precio}`).join('\n')
        : "No se encontraron productos específicos para esta consulta.";

      // Crear el mensaje completo
      const fullPrompt = await prompt.format({
        message,
        context,
        chat_history: memory.chatHistory || []
      });

      // Obtener respuesta directamente del modelo
      const response = await chat.invoke(fullPrompt);
      
      // Actualizar memoria
      await memory.saveContext(
        { input: message },
        { output: response }
      );

      // Devolver el contenido del mensaje de manera segura
      return response.content || // Si es un mensaje directo
             response.text || // Si viene como text
             response.kwargs?.content || // Si viene dentro de kwargs
             "Lo siento, no pude procesar tu mensaje."; // Mensaje por defecto
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      throw error;
    }
  };

  return { processMessage };
};

module.exports = { createChatAgent };
