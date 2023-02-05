const { Console } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

var log = [];
var colors = ['cyan', 'lime', 'yellow', 'orange', 'lavender', 'pink', 'tan', 'gray', 'white'];
names = [];
for(var i = 100; i > 0; i--) {
    names.push('user' + i)
}
var map = new Map();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    map.set(socket.id, [colors.pop(), names.pop()]);
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        colors.push(map.get(socket.id));
        colors.push(map.delete(socket.id))
    });
    socket.on('chat message', (msg) => {
        console.log(map)
        console.log('message: ' + msg);
        console.log('id: ' + socket.id);
        console.log('color: ' + map[socket.id]);
        log.push(msg);
        io.emit('chat message', [map.get(socket.id)[1] + ": " + msg, map.get(socket.id)[0]]);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});