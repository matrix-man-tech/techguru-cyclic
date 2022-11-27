const express = require("express")
const cors = require('cors')
const dotenv = require("dotenv")
const dbConnect = require('./config/db/dbConnect')
const userRoutes = require("./routes/users/userRoutes")
const { notFound, errorHandler } = require("./middleware/error/errorHandler")
const authMiddleware = require("./middleware/auth/authMiddleware")
const postRoutes = require('./routes/posts/postRoutes')
const commentRoutes = require('./routes/comments/commentRoutes')
const categoryRoute = require("./routes/category/categoryRoutes")
const chatRoute = require('./routes/chat/chatRoutes')
const messageRoute = require('./routes/chat/messageRoutes')


const app = express()
dotenv.config()
//db
dbConnect()

app.use(express.json())


app.use('/api/users',userRoutes)
app.use('/api/posts',postRoutes)
app.use('/api/comments',commentRoutes)
app.use('/api/category', categoryRoute)
app.use('/api/chat',authMiddleware,chatRoute)
app.use('/api/message',authMiddleware,messageRoute)

app.get('/', (req, res) => {
  res.send('API is running....')
})

app.use(notFound)
app.use(errorHandler)
app.use(authMiddleware)


const PORT = process.env.PORT 
app.listen(PORT, console.log(`server is running at ${PORT}`))

// const server=app.listen(PORT,()=>console.log(`Server started on port ${PORT}`))
 

//  //socket io
//  const io=require('socket.io')(server,{
//     pingTimeout:60000,
//     cors:{
//         origin:"*",
       
//     }
//  })

//  io.on("connection", (socket) => {
//     //connected to correct id
//     socket.on("setup", (userData) => {
//       socket.join(userData._id);
  
//       socket.emit("connected");
//     });
  
//     socket.on("join-chat", (room) => {
//       socket.join(room);
//     });
  
//     socket.on("typing", (room) => socket.in(room).emit("typing"));
//     socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));
  
//     socket.on("new-message", (newMessageReceived) => {
//       let chat = newMessageReceived.chat;
  
//       if (!chat.users) return console.log(`chat.users not defined`);
  
//       chat.users.forEach((user) => {
//         if (user._id === newMessageReceived.sender._id) return;
  
//         socket.in(user._id).emit("message-received", newMessageReceived);
//       });
//     });
  
//     socket.off("setup", () => {
//       socket.leave(userData._id);
//     });
//   });

  
