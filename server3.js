const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { Emitter } = require("@socket.io/redis-emitter");


const io = new Server();

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
    console.log('A user connected');
    console.log("SIDS: ", io.of("/").adapter.sids);
    console.log("Rooms: ", io.of("/").adapter.rooms);

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });

    socket.on('chat message', (msg) => {
        console.log('message:', msg);

        io.emit('chat message', msg);
        // emitter.emit('chat message', msg); // Emit to Redis
        // emitter.serverSideEmit('chat message', msg); // Emit to Redis
    })
})

io.listen(3000);