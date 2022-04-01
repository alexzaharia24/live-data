const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use('/modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });

    socket.on('chat message', (msg) => {
        console.log('message:', msg);

        io.emit('chat message', msg);
    })
})

server.listen(3000, () => {
    console.log("Listening on 3000");
})