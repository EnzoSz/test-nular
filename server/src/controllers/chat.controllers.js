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
    
    // Asegurarnos de que la respuesta sea un string
    const responseText = typeof response === 'string' ? response : 
                        response?.content || 
                        "Lo siento, hubo un error al procesar tu mensaje.";
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
};

module.exports = { chatWithAI };
