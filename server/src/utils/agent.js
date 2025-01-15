const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require("@langchain/core/prompts");
const { Product } = require("../models/Product");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory } = require("langchain/memory");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { Document } = require("langchain/document");
const Order = require('../models/Order');

const chat = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 500,
});

// Vector Store
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para convertir productos a documentos
function productsToDocuments(products) {
  return products.map(product => {
    const content = `
      Nombre: ${product.nombre}
      Descripción: ${product.descripcion}
      Precio: ${product.precio}
      Categoría: ${product.categoria}
      Ingredientes: ${product.ingredientes.join(', ')}
    `.trim();

    return new Document({
      pageContent: content,
      metadata: { id: product._id.toString() }
    });
  });
}

// Función para crear o actualizar el índice vectorial
async function updateVectorStore(products) {
  const documents = productsToDocuments(products);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );
  return vectorStore;
}

// Función para recuperar productos relevantes
async function retrieveRelevantProducts(query, vectorStore) {
  const results = await vectorStore.similaritySearch(query, 3);
  return results.map(doc => doc.pageContent).join('\n\n');
}

// Función para recuperar todos los productos
async function getAllProducts() {
  try {
    return await Product.find({ disponible: true });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

// Agregar esta función antes de createOrder
async function extractOrderDetails(message) {
  try {
    const systemTemplate = `
      Eres un asistente que extrae información de pedidos.
      
      Productos disponibles:
      - California Roll
      - Spicy Tuna Roll
      - Dragon Roll
      - Sashimi de Salmón
      - Nigiri Mixto
      - Veggie Roll

      Reglas:
      1. Usa exactamente los nombres de productos listados arriba
      2. Las cantidades deben ser números
      3. Incluye el nombre del cliente
      
      Debes responder con un JSON que contenga:
      - customerName: nombre del cliente (string)
      - items: array de productos con:
        - productName: nombre exacto del producto (string)
        - quantity: cantidad (número)

      NO incluyas explicaciones adicionales, solo el JSON.
    `;

    const humanTemplate = "Extrae los detalles del pedido: {input}";

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", humanTemplate],
    ]);

    const formattedPrompt = await chatPrompt.formatMessages({
      input: message,
    });

    const response = await chat.invoke(formattedPrompt);
    console.log('Respuesta del modelo:', response);

    try {
      // Extraer JSON de la respuesta
      let jsonStr = response.content;
      // Limpiar el texto para asegurar que solo tenemos JSON
      jsonStr = jsonStr.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.log('No se encontró JSON en la respuesta:', response.content);
        return null;
      }
      
      const orderDetails = JSON.parse(jsonMatch[0]);
      console.log('OrderDetails parseado:', orderDetails);
      
      // Validación más estricta
      if (!orderDetails.customerName || 
          !Array.isArray(orderDetails.items) || 
          orderDetails.items.length === 0 ||
          !orderDetails.items.every(item => 
            item.productName && 
            typeof item.quantity === 'number' && 
            item.quantity > 0)) {
        console.log('Validación fallida para orderDetails:', orderDetails);
        return null;
      }

      return orderDetails;
    } catch (e) {
      console.error('Error parseando JSON del pedido:', e);
      console.log('Respuesta original:', response.content);
      return null;
    }
  } catch (error) {
    console.error('Error extrayendo detalles del pedido:', error);
    return null;
  }
}

// También actualizar el template principal
const mainSystemTemplate = `
Eres un asistente amable y profesional de un restaurante de sushi.

Reglas:
- No respondas preguntas que no sean sobre el local o los productos.
- Responde amablemente y con respeto.
- Agrega emojis a tus respuestas.
- Si te preguntan por productos específicos, usa la información del contexto.
- Cuando el cliente quiera hacer un pedido, pregunta su nombre y confirma los items.

Contexto de productos: {context}
`;

const mainHumanTemplate = "{input}";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", mainSystemTemplate],
  ["human", mainHumanTemplate],
]);

// Función para crear un pedido
async function createOrder(customerName, items) {
  try {
    const orderItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findOne({ 
        nombre: { $regex: new RegExp(item.productName, 'i') } 
      });
      
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productName}`);
      }

      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.precio
      };
    }));

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      items: orderItems,
      total,
      customerName,
      status: 'pending'
    });

    await order.save();
    return order;
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    throw error;
  }
}

const createChatAgent = async () => {
  // Inicializar el vector store con todos los productos
  const allProducts = await getAllProducts();
  const vectorStore = await updateVectorStore(allProducts);

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
    // verbose: true,
  });

  // Modificar processMessage para manejar pedidos
  const processMessage = async (message) => {
    try {
      const relevantProducts = await retrieveRelevantProducts(message, vectorStore);
      
      // Detectar si es un pedido
      if (message.toLowerCase().includes('pedido') || 
          message.toLowerCase().includes('ordenar') || 
          message.toLowerCase().includes('piezas') ||
          message.toLowerCase().includes('quiero')) {
        
        const orderDetails = await extractOrderDetails(message);
        console.log('Detalles del pedido extraídos:', orderDetails); // Para debugging
        
        if (!orderDetails) {
          return `Por favor, proporciona tu pedido en este formato:\nNombre: [tu nombre]\nPedido: [cantidad] [producto], [cantidad] [producto]\n\nPor ejemplo:\nNombre: Juan\nPedido: 2 California Roll, 3 Dragon Roll 🍱`;
        }

        try {
          const order = await createOrder(orderDetails.customerName, orderDetails.items);
          return `¡Excelente! 🎉\n\nResumen del pedido:\nCliente: ${orderDetails.customerName}\n${orderDetails.items.map(item => 
            `- ${item.quantity}x ${item.productName}`
          ).join('\n')}\n\nNúmero de orden: ${order._id}\nTotal: $${order.total.toFixed(2)}\n\n¿Hay algo más en lo que pueda ayudarte? 🍣`;
        } catch (error) {
          return `Lo siento, hubo un error al procesar tu pedido: ${error.message}\n¿Podrías verificar los nombres de los productos? 😅`;
        }
      }

      // Si no es un pedido, respuesta normal
      const response = await chain.call({
        input: message,
        context: relevantProducts || "No se encontraron productos específicos para esta consulta.",
      });

      return response.response;
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      throw error;
    }
  };

  return { 
    processMessage,
    updateProducts: async () => {
      const products = await getAllProducts();
      await updateVectorStore(products);
    }
  };
};

module.exports = { createChatAgent };
