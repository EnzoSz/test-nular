const { createChatAgent } = require('../utils/agent');

let chatAgent;

// Inicializar el agente
(async () => {
  chatAgent = await createChatAgent();
})();

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!chatAgent) {
      return res.status(500).json({ error: "El agente de chat no está inicializado" });
    }

    const response = await chatAgent.processMessage(message);
    res.json({ response });
  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
};

// Nuevo endpoint para actualizar el índice vectorial
const updateProductIndex = async (req, res) => {
  try {
    if (!chatAgent) {
      return res.status(500).json({ error: "El agente de chat no está inicializado" });
    }

    await chatAgent.updateProducts();
    res.json({ message: "Índice de productos actualizado exitosamente" });
  } catch (error) {
    console.error('Error actualizando índice:', error);
    res.status(500).json({ error: "Error al actualizar el índice de productos" });
  }
};

module.exports = { chatWithAI, updateProductIndex };
