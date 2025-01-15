const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chat.controllers');

router.post('/chat', chatWithAI);

module.exports = router;