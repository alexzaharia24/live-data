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

// TODO: enable sticky sessions? Or disable HTTP polling
const run = async () => {
    const pubClient = createClient({ url: "redis://172.20.0.2:6379" });
    const subClient = pubClient.duplicate();
    
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
            console.log('messsage:', msg);
    
            io.emit('chat message', msg);
        })
    })
    
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        server.listen(process.env.PORT, () => {
            console.log(`Listening on ${process.env.PORT}`);
        })
      });
}

run();