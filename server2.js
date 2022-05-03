const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { Emitter } = require("@socket.io/redis-emitter");

const io = new Server(server);

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await pubClient.connect();

const emitter = new Emitter(pubClient);

io.adapter(createAdapter(pubClient, subClient));

app.use('/modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

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
        emitter.emit('chat message, msg'); // Emit to Redis
    })
})


server.listen(4000, () => {
    console.log("Listening on 4000");
})