const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add(socket.id);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('message', (data) => {
    io.to(room).emit('data',data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    rooms.forEach((users, room) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        console.log(`User ${socket.id} left room ${room}`);
        if (users.size === 0) {
          rooms.delete(room);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
