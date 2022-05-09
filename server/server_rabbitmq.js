const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');

const amqp_adapter = require('socket.io-amqp');


const io = new Server(server);

// TODO: enable sticky sessions? Or disable HTTP polling
const run = async () => {
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

            io.emit("chat message", msg);
        })
    })


    io.adapter(amqp_adapter('amqp://localhost', {
        prefix: "socketio-chat",
        useInputExchange: true,
        channelSeperator: "/",
        queueName: ""
    }));

    console.log("Adapter: ", io.of("/").adapter);

    io.of("/").adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
    });

    io.of("/").adapter.on("join-room", (room, id) => {
        console.log(`socket ${id} has joined room ${room}`);
    });

    server.listen(process.env.PORT, () => {
        console.log(`Listening on ${process.env.PORT}`);
    })
}

run();