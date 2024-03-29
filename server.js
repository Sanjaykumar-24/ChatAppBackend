const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = []

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('getAllRooms',()=>{
    socket.emit("roomList",rooms)
  })
  
  socket.on('createRoom',(data)=>{
    rooms.unshift({
      id:rooms.length+1,
      roomId:data.roomId,
      messages:[]
    })
    socket.join(data.roomId);
    console.log(`${data.name} created room ${data.roomId}`);
    console.log(rooms)
  })

  socket.on("joinRoom", (data) => {
    socket.join(data.roomId);
    console.log(`${data.name} joined room ${data.roomId}`);
  });

  socket.on('newMessage',(data)=>{
    const {message,roomId,name} = data
    const room = rooms.filter((r)=>r.roomId === roomId)
    const newmessage = {
       name:name,
       message:message
    }
    room[0].messages.push(newmessage)
    io.to(roomId).emit('roomMessage',newmessage)
    console.log(room[0].messages,roomId)
  })


})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
