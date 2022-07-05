const socket = io();
let roomId;

/************************************************************************************************/
/*                                     HANDLE CLICK EVENTS                                      */
/************************************************************************************************/
// Create a new room and join the room
btn_createRoom.addEventListener('click', ()=>{
    let playerName=input_PlayerName_create.value.trim();
    let roomCapacity=parseInt(select_numberOfPlayer.value);

    if(playerName){
        socket.emit("createRoom", playerName, roomCapacity);
    }else{
        txt_errorMessage_create.innerHTML="Please enter your name";
    }
})

// Join an existing room
btn_joinRoom.addEventListener('click', ()=>{
    let roomId = input_roomId.value;
    let playerName = input_PlayerName_join.value.trim();

    if(roomId && playerName){
        socket.emit("joinRoom", roomId, playerName);
    }else{
        txt_errorMessage_join.innerHTML="Please enter the room ID and your name.";
    }
});

// Click event on the canvas
canvas.addEventListener('click', event => {
    let canvasPosition=canvas.getBoundingClientRect();
    let click_x = event.clientX-canvasPosition.x;  //Coordinate of the click event relative to the canvas
    let click_y = event.clientY-canvasPosition.y;
    let row = Math.floor(click_y/CELL_HEIGHT);     //gameboard cell(row&col) corresponds to the canvas coordinate
    let col = Math.floor(click_x/CELL_WIDTH);

    socket.emit("click", roomId, row, col);
});

// Reset game
button_reset.addEventListener('click', ()=>{
    let resetConfirmation = confirm("Are you sure you want to reset the game?");

    if(resetConfirmation){
        socket.emit("reset", roomId);
    }
});

// Player ends her turn
button_done.addEventListener('click', ()=>{
    socket.emit("endTurn", roomId);
});

roomidEl.addEventListener('click', ()=>{
    navigator.clipboard.writeText(roomId);
})

window.onbeforeunload = e => {
    e.preventDefault();
    return "Are you sure you want to leave the game?";
}

/************************************************************************************************/
/*                               HANDLE MESSAGES FROM SERVER                                    */
/************************************************************************************************/
socket.on("joined", (id)=>{
    roomId = id
    showGameScreen();
})

socket.on("announceNewPlayer", (playerNames)=>{
    if(playerNames.length===1){
        waitingEl.innerHTML=`${playerNames} has joined.`
    }else{
        let names = playerNames.join(", ")
        waitingEl.innerHTML=`${names} have joined.`
    }

    waitingEl.innerHTML += "<br/></br/>Waiting for other players to join..."
})

socket.on("error", message=>{
    // Types of error: 
    // room is full
    // room does not exist
    txt_errorMessage_join.innerHTML=message;
})

socket.on("startGame", (gameboard, firstPlayerName, firstPlayerColor, currentPlayerSocket)=>{
    // Reset the DOM elements
    waitingEl.style.display="none";
    canvas_container.style.display="block";
    button_done_text.innerHTML = firstPlayerName;
    button_done.style.backgroundColor=firstPlayerColor;
    img_winner.src="./images/questionMark.png";

    const step_counters = document.querySelectorAll(".marble p");
    step_counters.forEach(counter=>{
        counter.innerHTML="0";
    })

    if(currentPlayerSocket===socket.id){
        game_message.innerHTML = `<i class="fa-solid fa-check green-check"></i> It is your turn!`
    }else{
        game_message.innerHTML = `<i class="fa-solid fa-xmark red-x"></i> Please wait for your turn...`
    }

    drawGameboard(gameboard);
})

socket.on("drawSelected", (x, y, playerColor)=>{
    drawSelected(x, y, playerColor);
})

socket.on("drawCircle", (x, y, playerColor)=>{
    drawCircle(x, y, playerColor);
})

socket.on("drawCircleWithBorder", (x, y, color)=>{
    drawCircleWithBorder(x, y, color);
})

socket.on("showValidNextMoves", (validNextMoves, playerColor)=>{
    showValidNextMoves(validNextMoves, playerColor);
})

socket.on("increaseSteps", (playerColor, steps)=>{
    let color = playerColor.toLowerCase();
    let domElement_steps = document.querySelector(`.${color} p`);
    domElement_steps.innerHTML=steps;
})

socket.on("nextPlayer", (nextName, nextColor, nextSocket, completedSockets)=>{
    button_done_text.innerHTML = nextName;
    button_done.style.backgroundColor=nextColor;

    if(nextSocket===socket.id){
        game_message.innerHTML = `<i class="fa-solid fa-check green-check"></i> It is your turn!`
    }else if(completedSockets.includes(socket.id)){
        game_message.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> You have completed!`
    }else{
        game_message.innerHTML = `<i class="fa-solid fa-xmark red-x"></i> Please wait for your turn...`
    }
})

socket.on("winner", (winnerImage)=>{
    img_winner.src=winnerImage;
})

socket.on("allCompleted", ()=>{
    game_message.innerHTML = `The game has finished <i class="fa-solid fa-thumbs-up"></i>.  Click 'Reset' to play again!`
})

/************************************************************************************************/
/*                                        HELPER FUNCTIONS                                      */
/************************************************************************************************/
function showGameScreen(){
    container_startScreen.style.display="none";
    container_gameScreen.style.display="flex";
    roomidEl.innerHTML=roomId;
}

function showValidNextMoves(validNextMoves, playerColor){
    if(validNextMoves.length>0){
        validNextMoves.forEach(item=>{
            if(item.length>0){
                drawValidMove(item[1]*CELL_WIDTH, item[0]*CELL_HEIGHT, playerColor);
            }
        })
    }
}

function drawGameboard(gameboard){
    for(let r=0;r<NUM_OF_ROWS;r++){
        for(let c=0;c<NUM_OF_COLS;c++){
            if(gameboard[r][c].type==COMMON){
                drawCircleWithBorder(c*CELL_WIDTH, r*CELL_HEIGHT, gameboard[r][c].originalColor);
            }else{
                if(gameboard[r][c].isPlayer){
                    drawCircle(c*CELL_WIDTH, r*CELL_HEIGHT, gameboard[r][c].originalColor);
                }else if(gameboard[r][c].type!=INVALID && !gameboard[r][c].currentPlayer){
                    drawCircleWithBorder(c*CELL_WIDTH, r*CELL_HEIGHT, gameboard[r][c].originalColor);
                }
            }
        }
    }
}

function drawCircle(x, y, color){
    let gradient = ctx.createRadialGradient(x, y, RADIUS/10, x, y, RADIUS*2);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, color);

    ctx.beginPath();
    ctx.fillStyle=gradient;
    ctx.arc(x+RADIUS, y+RADIUS, RADIUS, 0, 2*Math.PI); //need to add RADIUS to move the starting point, else some circles will be cut in half at the canvas border
    ctx.fill();
}

function drawCircleWithBorder(x, y, color){
    ctx.beginPath();
    ctx.fillStyle="WHITE"
    ctx.strokeStyle = color;
    ctx.lineWidth=1.5;
    ctx.arc(x+RADIUS, y+RADIUS, RADIUS, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawSelected(x, y, color){
    ctx.beginPath();
    ctx.fillStyle=color;
    ctx.strokeStyle=color;
    ctx.lineWidth=1.5;
    ctx.arc(x+RADIUS, y+RADIUS, RADIUS, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawValidMove(x,y,color){
    let gradient = ctx.createRadialGradient(x, y, RADIUS/5, x, y, RADIUS*5);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.8, color);

    ctx.beginPath();
    ctx.fillStyle=gradient;
    ctx.lineWidth=4;
    ctx.arc(x+RADIUS, y+RADIUS, RADIUS, 0, 2*Math.PI);
    ctx.fill();
}
