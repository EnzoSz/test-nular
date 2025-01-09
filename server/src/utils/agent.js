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
Eres un asistente amable de un restaurante de sushi. Utiliza la siguiente información sobre nuestros productos:
{context}

Mensaje del cliente: {message}

Proporciona una respuesta útil sobre nuestros productos de sushi, ayudando al cliente a hacer su pedido.
Si no hay productos relevantes para la consulta, ofrece recomendaciones generales del menú.
`;

const prompt = PromptTemplate.fromTemplate(template);

const chatAgent = new RunnableSequence.from([

    {
        context: async (input) => {
            const products = await retrieveProducts(input.message);
            return JSON.stringify(products, null, 2);
        },
        message:  (input) => input.message,
    },
    prompt,
    chat,
    new StringOutputParser(),
])

module.exports = chatAgent;
