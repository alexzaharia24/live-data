const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { createAdapter } = require("@socket.io/postgres-adapter");
const { Pool } = require("pg");

const io = new Server(server);

const pool = new Pool({
    user: "converge",
    host: "localhost",
    database: "postgres",
    password: "converge",
    port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
  );
`);


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

            io.emit('chat message', msg);
        })
    })


    io.adapter(createAdapter(pool));
    server.listen(process.env.PORT, () => {
        console.log(`Listening on ${process.env.PORT}`);
    })
}

run();