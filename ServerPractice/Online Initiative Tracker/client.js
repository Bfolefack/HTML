var socket = io();
var player = document.getElementById('player');
var gm = document.getElementById('gm');

var character_name;
var AC;
var initiative = new Map();
var role = "";

var timer_value = 0;
var paused = true;
var offset = 0;
var selected = "";
var numDisplay;
var shifted = false;


function GMLogin() {
    
    character_name = prompt("GM Password")
    var out = character_name;
    if (out == "admin") {
        role = "GM"
        startTimer();
        document.getElementById("main-menu").style.display = "none";
        document.getElementById("gm-view").style.display = "block";
        numDisplay = document.getElementById(role + "NumDisplay");
        socket.emit('select name', ["admin"]);
    }
    
}

function playerLogin() {
    character_name = prompt("Character Name")
    while(character_name == null || character_name == ""){
        character_name = prompt("Please Enter a Valid Name!")
    }
    console.log(parseFloat("jfdksahflksa"))
    
    tempInitNum = prompt("Initiative")
    while(tempInitNum == null || initiative == "" || isNaN(parseFloat(tempInitNum))){
        tempInitNum = prompt("Please Enter a Valid Initiative!")
    }
    console.log(tempInitNum)
    tempInitNum = parseFloat(tempInitNum) + Math.random()/1000;
    console.log(tempInitNum)

    if (character_name == "admin") {
        return;
    }
    var AC = prompt("Armor Class");
    while(AC == null || AC == "" || isNaN(parseFloat(AC))){
        AC = prompt("Please Enter a Valid AC!")
    }

    
    role = "Player"
    startTimer();
    document.getElementById(role + "InitiatveNumberInput").value = 20;

    socket.emit('select name', [character_name, parseFloat(tempInitNum), AC]);
    console.log(character_name);

    document.getElementById("main-menu").style.display = "none";
    document.getElementById("player-view").style.display = "block";
}

function startTimer(){
    numDisplay = document.getElementById(role + "NumDisplay");
    var timer = setInterval(function(){
        if(!paused && timer_value > 0){
            timer_value--;
        }
        if(timer_value <= 20 && timer_value > 0 && !paused){
            if(document.body.style.backgroundColor == "yellow")
                document.body.style.backgroundColor = "white";
            else
                document.body.style.backgroundColor = "yellow";
        }
        

        numDisplay.innerHTML = String(Math.floor(timer_value/60) + ":" + ((timer_value % 60)/10 >= 1 ? "":"0") + timer_value % 60);
    }, 1000);
    

    var timer = setInterval(function(){
        if(timer_value <= 0 && !paused){
            if(document.body.style.backgroundColor == "red")
                document.body.style.backgroundColor = "white";
            else
                document.body.style.backgroundColor = "red";
        }
    }, 50);
}

function updateDisplay(){
    numDisplay.innerHTML = String(Math.floor(timer_value/60) + ":" + ((timer_value % 60)/10 >= 1 ? "":"0") + timer_value % 60);
    document.body.style.backgroundColor = "white"
}

function compareNumbers(a, b) {
    diff =  parseFloat(b) - parseFloat(a);
    if(diff == 0){
        diff = -1;
    }
    return diff;
}
function renderList(){
    if(role != ""){
        document.getElementById(role + "InitiativeList").innerHTML = "";
        //for(var i = 0; i < offset; i++){
        //    temp = initiative.entries().next().value;
        //    initiative.delete(temp[0])
        //    initiative.set(temp[0], temp[1])
        //}
        
        for (let [key, value] of initiative) {
            var li = document.createElement("li");
            li.innerHTML = parseInt(key) + " " + value;
            li.id = value;
            li.style.cursor = "pointer";
            li.onclick = function(){removeElement(key)};
            document.getElementById(role + "InitiativeList").appendChild(li);
        }

        if(initiative.size > 0){
            temp = initiative.entries()
            id =  temp.next().value[1];
            for (let i = 0; i < offset; i++) {
                id = temp.next().value[1];
            }
            document.getElementById(id).style.backgroundColor = "lime";
            console.log(document.getElementById(id).style.backgroundColor)
        }
    }
}

function unpauseTimer(){
    socket.emit('unpause timer', []);
}

function pauseTimer(){
    socket.emit('pause timer', []);
}

function resetTimer(){
    socket.emit('reset timer', []);
}

function addTime(num){
    socket.emit('add time', num);
}

function clearInitiative(){
    socket.emit('clear initiative', []);
}

function removeElement(key){
    socket.emit('remove element', key);
}

function addElement(){
    var tempName = document.getElementById(role + "InitiatveNameInput").value;
    var tempInitNum  = document.getElementById(role + "InitiatveNumberInput").value;
    var tempAC = document.getElementById(role + "InitiatveACInput").value;

    if(tempName == null || tempName == "" || tempName == "admin"){
        return;
    }

    if(tempInitNum == null || tempInitNum == "" || isNaN(parseFloat(tempInitNum))){
        return;
    }
    
    tempInitNum = parseFloat(tempInitNum) + Math.random()/1000;
    if (tempAC == null || tempAC == "" || isNaN(parseFloat(tempAC))){
        return;
    }

    socket.emit('add element', [tempName, parseFloat(tempInitNum), parseFloat(tempAC)]);
    character_name = tempName;
}

function nextTurn(){
    if(role == "GM"){
        socket.emit('next turn', ["admin"]);
    } else {
        socket.emit('next turn', [character_name]);
    }
}

socket.on('update', function (data) {
    console.log(data);
    initiative = new Map();
    timer_value = data[0];
    offset = data[1];
    paused = data[2];
    for (var i = 0; i < data[3].length; i++) {
        initiative.set(data[3][i][0], data[3][i][1]);
    }
    console.log(initiative);
    console.log(offset);
    console.log(selected);
    console.log(timer_value);
    if(numDisplay != null){
        updateDisplay();
    }
    renderList();
}
);
