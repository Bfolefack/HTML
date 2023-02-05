const {Console, time} = require('console');
const e = require('express');
const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = require('socket.io')(server);

var timer_value = 60;
var paused = false;
var initiative = new Map;
var players = new Map;
var clients = new Map;
var GM;

var timer_value = 0;
var paused = true;
var offset = 0;
var selected = "";

var timer = setInterval(function(){
    if(!paused && timer_value > 0){
        timer_value--;
        console.log(timer_value)
    }
}, 1000);

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });
app.use(express.static(__dirname));
app.get('/', (req, res) => {
}); 

io.on('connection', (socket) => {
    console.log("a user connected");
    socket.on('select name', (out) => {
        console.log("Name Selected")
        if(out[0] == 'admin'){
            GM = socket.id;
            console.log("GM Connected")
            
            updateClients();
        } else {
            clients.set(socket.id, out[0]);
            players.set(out[0], out[1]);
            initiative.set(out[1], out[0] + " AC: " + out[2])
            console.log(out)

            updateClients();
        }
    });

    socket.on("unpause timer", () => {
        paused = false;
        updateClients();
    });

    socket.on("pause timer", () => {
        paused = true;
        updateClients();
    });

    socket.on("reset timer", () => {
        timer_value = 0;
        paused = true;
        updateClients();
    });

    socket.on("add time", (num) => {
        timer_value += num;
        updateClients();
    });

    socket.on("clear initiative", (num) => {
        initiative = new Map();
        offset = 0;
        selected = "";

        updateClients();
    });

    socket.on("next turn", (out) => {
        if(out[0] == "admin"){
            offset++;
            if(offset >= initiative.size)
                offset = 0;
            checkPause();
        } else if (out[0] == selected){
            offset++;
            if(offset >= initiative.size)
                offset = 0;
            checkPause();
        }

        updateClients();
    });

    socket.on("remove element", (out) => {
        if(socket.id == GM){
            deleted_name = initiative.get(out);
            initiative.delete(out);
            players.delete(deleted_name.split(" AC:")[0]);
        }
        updateClients();
    });

    socket.on("add element", (out) => {
        if(socket.id == GM){
            initiative.set(out[1], out[0] + " AC: " + out[2]);
            players.set(out[1], out[0]);
        } else {
            initiative.delete(players.get(clients.get(socket.id)));
            initiative.set(out[1], out[0] + " AC: " + out[2]);
            players.set(out[0], out[1]);
            clients.set(socket.id, out[0]);
        }
        updateClients();
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if(clients.has(socket.id)){
            initiative.delete(players.get(clients.get(socket.id)));
            players.delete(clients.get(socket.id));
            clients.delete(socket.id);
        }
        updateClients();
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

function compareNumbers(a, b) {
    return parseFloat(b) - parseFloat(a);
}

function sortInititative(){
    initiative = new Map([...initiative.entries()].sort(compareNumbers));
    if(initiative.size > 0)
        selected = Array.from(initiative)[offset][1].split(" AC:")[0];
    else
        selected = "";
}

function checkPause(){
    selected = Array.from(initiative)[offset][1].split(" AC:")[0];
    if(players.has(selected)){
        paused = false;
        timer_value += 60;
    } else {
        paused = true;
    }
}

function updateClients(){
    sortInititative();
    initArr = Array.from(initiative);

    arr = [timer_value, offset, paused, Array.from(initiative)]

    io.emit('update', arr);
}