const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { Product } = require("../models/Product");
const { ConversationChain } = require("langchain/chains");
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
El siguiente es una conversación amigable con un asistente de un restaurante de sushi.
El asistente es servicial, amable y muy conocedor de los productos del menú.

Contexto de productos disponibles: {context}
Historial de conversación: {history}
Humano: {input}
Asistente:`;

const prompt = PromptTemplate.fromTemplate(template);

const createChatAgent = async () => {
  // Configurar la memoria
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    inputKey: "input",
  });

  // Crear la cadena de conversación
  const chain = new ConversationChain({
    llm: chat,
    memory: memory,
    prompt: prompt,
    verbose: true,
  });

  // Función para procesar mensajes
  const processMessage = async (message) => {
    try {
      // Buscar productos relevantes
      const products = await retrieveProducts(message);
      const context = products.length > 0 
        ? products.map(p => `${p.nombre}: ${p.descripcion} - Precio: ${p.precio}`).join('\n')
        : "No se encontraron productos específicos para esta consulta.";

      // Ejecutar la cadena de conversación
      const response = await chain.call({
        input: message,
        context: context,
      });

      return response.response;
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      throw error;
    }
  };

  return { processMessage };
};

module.exports = { createChatAgent };
