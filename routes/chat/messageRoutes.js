const express=require('express');
const authMiddleware = require('../../middleware/auth/authMiddleware');
const messageRoute = express.Router()

const {allMessages,sendMessage}=require('../../controllers/chat/messageController')

 messageRoute.post('/',sendMessage)
 messageRoute.get('/:chatId',allMessages)

 module.exports=messageRoute