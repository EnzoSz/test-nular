const { chatAgent } = require('../utils/agent.js');

const chatController = {
    answer: async (req, res) => {
        try {
            const { message } = req.body;
            if (!chatAgent || typeof chatAgent.invoke !== 'function') {
                return res.status(500).json({ error: 'chatAgent no esta configurado correctamente' });
            }
            const response = await chatAgent.invoke({ message });
            res.json({ reply: response });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = chatController;
