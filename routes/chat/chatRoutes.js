const express=require('express');
const authMiddleware = require('../../middleware/auth/authMiddleware');
const chatRoute = express.Router()
const {getChat,getChats,createGroup,renameGroup,removeFromGroup,addUserToGroup}=require('../../controllers/chat/chatController')

chatRoute.route("/").post(getChat).get(getChats);
chatRoute.route("/createGroup").post(createGroup);
chatRoute.route("/renameGroup").patch(renameGroup);
chatRoute.route("/removeFromGroup").patch(removeFromGroup);
chatRoute.route("/addUserToGroup").patch(addUserToGroup);

 module.exports = chatRoute