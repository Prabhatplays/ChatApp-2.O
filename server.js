const http = require('http');
const express = require('express');
const path = require('path');
require('dotenv').config();
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//-----middlewares----

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

//routes

const authRoutes = require('./src/Routes/auth.js');
app.use('/auth' , authRoutes);
app.get('/', (req , res)=>{
    res.sendFile(path.join(__dirname, 'Public', 'frontend' , 'login.html'
    ));
})
// ── Socket.io ────────────────────────────────
const socketHandler = require('./src/Socket/chat.js');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(socket, io);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);

});