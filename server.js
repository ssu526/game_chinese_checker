const express = require('express');
const socketio= require('socket.io');
const CONSTANTS = require('./constants');


/************************************************************************************************/
/*                                             APP SETUP                                        */
/************************************************************************************************/
const app = express();
const server = app.listen(8080, function(){
    console.log("listening to 8080...");
})
app.use(express.static('public')); 


/************************************************************************************************/
/*                                         SOCKET & ROOMS                                       */
/************************************************************************************************/
const io = socketio(server);
const rooms = {};

io.on("connection", socket=>{
    // CREATE A ROOM & JOIN
    socket.on("createRoom", (roomId, playerName, roomCapacity)=>{
        socket.join(roomId);
        
        const playerColors = getPlayerColors(roomCapacity);

        rooms[roomId]={
            capacity:roomCapacity, 
            colors:playerColors,
            numberOfPlayers:1,
            playerNames:[playerName],
            steps:[0],
            completed:[false]       
        }

        socket.emit("joined", "0", playerColors[0]);
        io.to(roomId).emit("announceNewPlayer", playerName);
    })

    // JOIN AN EXISTING ROOM
    socket.on("joinRoom", (roomId, playerName)=>{
        if(rooms[roomId]!=undefined){
            if(rooms[roomId].capacity==rooms[roomId].numberOfPlayers){
                socket.emit("error", "Room is full");
            }else{
                let currentNumber = rooms[roomId].numberOfPlayers;

                rooms[roomId].playerNames.push(playerName);
                rooms[roomId].steps.push(0);
                rooms[roomId].completed.push(false);

                socket.join(roomId);

                socket.emit("joined", currentNumber, rooms[roomId].colors[currentNumber]);
                io.to(roomId).emit("announceNewPlayer", playerName);

                rooms[roomId].numberOfPlayers=currentNumber+1;

                // START GAME
                if(rooms[roomId].capacity==rooms[roomId].numberOfPlayers){
                    const gameboard = initGameboard(rooms[roomId]);
                    const firstPlayerName = rooms[roomId].playerNames[0];
                    io.to(roomId).emit("startGame", gameboard, firstPlayerName);
                }
            }
        }else{
            io.emit("error", "Room does not exist");
        }
    })

    // SOCKET - DRAW ON CANVAS
    socket.on("drawSelected", (roomId, x, y, playerColor)=>{
        socket.broadcast.to(roomId).emit("drawSelected", x, y, playerColor);
    })

    socket.on("drawCircle", (roomId, x, y, playerColor)=>{
        socket.broadcast.to(roomId).emit("drawCircle", x, y, playerColor);
    })

    socket.on("drawCircleWithBorder", (roomId, x, y, color)=>{
        socket.broadcast.to(roomId).emit("drawCircleWithBorder", x, y, color);
    })

    socket.on("showValidNextMoves", (roomId, validNextMoves, playerColor)=>{
        socket.broadcast.to(roomId).emit("showValidNextMoves", validNextMoves, playerColor);
    })

    // SOCKET - UPDATE GAME
    socket.on("updateGameboard", (roomId, gameboard)=>{
        socket.broadcast.to(roomId).emit("updateGameboard", gameboard);
    })

    socket.on("endTurn", (roomId, currentPlayer)=>{

        const capacity = rooms[roomId].capacity;
        const numOfCompletion = rooms[roomId].completed.filter(item => item==true).length;

        let nextPlayer = (currentPlayer+1)%capacity;

        while(numOfCompletion!=capacity && rooms[roomId].completed[nextPlayer]){  //Skip the player who's completed
            nextPlayer=(currentPlayer+1)%capacity;
        }

        const nextName = rooms[roomId].playerNames[nextPlayer];
        const nextColor = rooms[roomId].colors[nextPlayer];
        io.to(roomId).emit("nextPlayer", nextPlayer, nextName, nextColor);
    })

    socket.on("completed", (roomId, playerId)=>{
        const numOfCompletion = rooms[roomId].completed.filter(item => item==true).length;

        if(numOfCompletion==0){
            const winnerColor = rooms[roomId].colors[playerId];
            const winnerImage = CONSTANTS.IMAGES[winnerColor];
            io.to(roomId).emit("winner", winnerImage);
        }

        rooms[roomId].completed[playerId]=true;
    })

    socket.on("increaseSteps", (roomId, playerId)=>{
        let steps = rooms[roomId].steps[playerId];
        steps=steps+1;
        rooms[roomId].steps[playerId] = steps;
        const playerColor = rooms[roomId].colors[playerId];
        io.to(roomId).emit("increaseSteps", playerColor, steps);
    })

    socket.on("reset", (roomId)=>{
        const gameboard = initGameboard(rooms[roomId]);
        const firstPlayerName = rooms[roomId].playerNames[0];
        io.to(roomId).emit("startGame", gameboard, firstPlayerName);
    })
})

/************************************************************************************************/
/*                                            FUNCTIONS                                         */
/************************************************************************************************/
function getPlayerColors(capacity){
    let gamePlayerColors=[];

    switch(capacity){
        case 2:
            gamePlayerColors = [CONSTANTS.PLAYERS_COLOR[0], CONSTANTS.PLAYERS_COLOR[1]];
            break;
        case 3:
            gamePlayerColors = [CONSTANTS.PLAYERS_COLOR[0], CONSTANTS.PLAYERS_COLOR[5], CONSTANTS.PLAYERS_COLOR[4]];
            break;
        case 4:
            gamePlayerColors = [CONSTANTS.PLAYERS_COLOR[0], CONSTANTS.PLAYERS_COLOR[1], CONSTANTS.PLAYERS_COLOR[5], CONSTANTS.PLAYERS_COLOR[2]];
            break;
        case 6:
            gamePlayerColors = [CONSTANTS.PLAYERS_COLOR[0], CONSTANTS.PLAYERS_COLOR[3], CONSTANTS.PLAYERS_COLOR[5], CONSTANTS.PLAYERS_COLOR[1], CONSTANTS.PLAYERS_COLOR[4], CONSTANTS.PLAYERS_COLOR[2]];
            break;
    }

    return gamePlayerColors;
}

function initGameboard(room){
    const playerColors = room.colors;
    let gameboard=[];

    //INITIALIZE ALL CELLS
    for(let r=0;r<CONSTANTS.NUM_OF_ROWS;r++){
        gameboard[r]=[];
        for(let c=0;c<CONSTANTS.NUM_OF_COLS;c++){
            gameboard[r][c] = {
                type:CONSTANTS.INVALID, 
                originalColor:CONSTANTS.INVALID_CELL, 
                currentColor:CONSTANTS.INVALID_CELL, 
                available:false, 
                isPlayer:false
            };
        }
    }

    //INITIALIZE GAME ZONES - PLAYER ZONES
    for(let i=0;i<CONSTANTS.PLAYER_ZONES.length;i++){
        for(let j=0;j<CONSTANTS.PLAYER_ZONES[i].length;j++){

            let row = CONSTANTS.PLAYER_ZONES[i][j][0];
            let col = CONSTANTS.PLAYER_ZONES[i][j][1];

            if(playerColors.includes(CONSTANTS.PLAYERS_COLOR[i])){
                gameboard[row][col] = {
                    type:CONSTANTS.PLAYER, 
                    originalColor:CONSTANTS.PLAYERS_COLOR[i], 
                    currentColor:CONSTANTS.PLAYERS_COLOR[i], 
                    available:false, 
                    isPlayer:true
                };
            }else{
                gameboard[row][col] = {
                    type:CONSTANTS.PLAYER, 
                    originalColor:CONSTANTS.AVAILABLE_COLOR, 
                    currentColor:CONSTANTS.AVAILABLE_COLOR, 
                    available:true, 
                    isPlayer:false
                };
            }
        }
    }

    //INITIALIZE GAME ZONES - COMMON ZONE
    CONSTANTS.COMMON_ZONE.forEach(cell=>{
        let row = cell[0];
        let col = cell[1];
        gameboard[row][col] = {
            type:CONSTANTS.COMMON, 
            originalColor:CONSTANTS.COMMON_CELL, 
            currentColor:CONSTANTS.COMMON_CELL, 
            available:true, 
            isPlayer:false
        };
    })

    return gameboard;
}

