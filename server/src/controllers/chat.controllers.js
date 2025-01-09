const { chatAgent } = require('../agents/chat.agent');

const chatController = {
    answer: async (req, res) => {
        try {
            const { message } = req.body;
            const response = await chatAgent.run({ message });
            res.json({ reply: response });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = chatController;
