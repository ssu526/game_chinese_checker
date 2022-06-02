const socket = io();
let roomId, playerId, playerColor, gameboard, currentPlayer, selected_piece, allow_single_step, validNextMoves;

/************************************************************************************************/
/*                                CREATE ROOM, JOIN ROOM, START GAME                            */
/************************************************************************************************/
// txt_newRoomId.innerHTML=generateRandomId();

btn_createRoom.addEventListener('click', ()=>{
    // roomId=txt_newRoomId.innerHTML;
    roomId=generateRandomId();
    let playerName=input_PlayerName_create.value.trim();
    let roomCapacity=parseInt(select_numberOfPlayer.value);

    if(playerName){
        socket.emit("createRoom", roomId, playerName, roomCapacity);
    }else{
        txt_errorMessage_create.innerHTML="Please enter your name";
    }
})

btn_joinRoom.addEventListener('click', ()=>{
    roomId = input_roomId.value;
    let playerName = input_PlayerName_join.value.trim();

    if(roomId && playerName){
        socket.emit("joinRoom", roomId, playerName);
    }else{
        txt_errorMessage_join.innerHTML="Please enter a room ID and your name.";
    }
});

socket.on("joined", (player, color)=>{
    showGameScreen(roomId);
    playerId=player;
    playerColor=color;
})

socket.on("announceNewPlayer", (playerName)=>{
    console.log(playerName+" joined.");
})

socket.on("error", message=>{
    txt_errorMessage_join.innerHTML=message;
})

socket.on("startGame", (board, firstPlayerName)=>{
    gameboard=board;
    currentPlayer=0;

    selected_piece=[];
    allow_single_step=true;
    validNextMoves=[];

    waitingEl.style.display="none";
    canvas_container.style.display="block";

    button_done_text.innerHTML = firstPlayerName;
    button_done.style.backgroundColor="red";

    img_winner.src="./images/questionMark.png";

    const step_counters = document.querySelectorAll(".marble p");
    step_counters.forEach(counter=>{
        counter.innerHTML="0";
    })
    
    drawGameboard();
})


/************************************************************************************************/
/*                            SOCKET - UPDATE GAMEBOARD & DRAW ON CANVAS                        */
/************************************************************************************************/
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

socket.on("updateGameboard", board=>{
    gameboard=board;
})

socket.on("nextPlayer", (nextPlayer, nextName, nextColor)=>{
    currentPlayer=nextPlayer;
    
    button_done_text.innerHTML = nextName;
    button_done.style.backgroundColor=nextColor;

    selected_piece= [];
    validNextMoves = [];
    allow_single_step=true;
})

socket.on("winner", (winnerImage)=>{
    img_winner.src=winnerImage;
})

socket.on("increaseSteps", (playerColor, steps)=>{
    let color = playerColor.toLowerCase();
    let domElement_steps = document.querySelector(`.${color} p`);
    domElement_steps.innerHTML=steps;
})


/************************************************************************************************/
/*                           GAME SCREEN EVENT - CANVAS, RESET, DONE                            */
/************************************************************************************************/
canvas.addEventListener('click', event=>play(event));

button_done.addEventListener('click', ()=>{
    // Only current player can click the done button
    if(playerId!=currentPlayer) return;

    // Player selected a piece & valid moves are shown, but player decided to end her turn without making any moves
    if(selected_piece!=null && selected_piece.length!=0){
        let y = selected_piece[0]*CELL_HEIGHT;
        let x = selected_piece[1]*CELL_WIDTH;
        let playerColor = PLAYERS_COLOR[playerId];
        drawCircle(x, y, playerColor); 
        socket.emit("drawCircle", roomId, x,y, playerColor);

        validNextMoves.forEach(item =>{
            let y = item[0]*CELL_HEIGHT;
            let x = item[1]*CELL_WIDTH;
            let playerColor = gameboard[item[0]][item[1]].originalColor;

            drawCircleWithBorder(x,y,playerColor);
            socket.emit("drawCircleWithBorder", roomId, x, y, playerColor);
        })
    }

    socket.emit("endTurn", roomId, currentPlayer);
});

button_reset.addEventListener('click', ()=>{
    socket.emit("reset", roomId);
});

/************************************************************************************************/
/*                                         FUNCTIONS - GAME                                     */
/************************************************************************************************/
function play(event){
    if(playerId!=currentPlayer) return;

    let canvasPosition=canvas.getBoundingClientRect();
    let click_x = event.clientX-canvasPosition.x;  //Coordinate of the click event relative to the canvas
    let click_y = event.clientY-canvasPosition.y;
    let row = Math.floor(click_y/CELL_HEIGHT);     //gameboard cell(row&col) corresponds to the canvas canvas coordinate
    let col = Math.floor(click_x/CELL_WIDTH);
    let y = row*CELL_HEIGHT;                       //x and y are upper-left coordinates of the gameboard cell
    let x = col*CELL_WIDTH;

    //If selected_piece is empty, the click event is for selecting a game piece
    if(selected_piece.length==0){
        if(gameboard[row][col].currentColor !== playerColor) return; //Player did not select her own piece

        selected_piece=[row, col];
        drawSelected(x, y, playerColor);
        socket.emit("drawSelected", roomId, x, y, playerColor);

        getValidNextMoves();

        if(validNextMoves.length>0){
            showValidNextMoves(validNextMoves, playerColor);
            socket.emit("showValidNextMoves", roomId, validNextMoves, playerColor);    
        }

        return;
    }


    //If selected_piece is not empty, the click event is for moving the game piece to the cell clicked
    let original_row = selected_piece[0];
    let original_col = selected_piece[1];
    let validDestination=false;  //Check that the selected destination is valid

    if(validNextMoves.length!=0){
        validNextMoves.forEach(item=>{
            if(row==item[0] && col==item[1]) validDestination=true;
        });
    
        if(validDestination){
            socket.emit("increaseSteps", roomId, playerId);

            //reset valid cells back to empty cells
            validNextMoves.forEach(item =>{
                let x = item[1]*CELL_WIDTH;
                let y =  item[0]*CELL_HEIGHT;
                let color = gameboard[item[0]][item[1]].originalColor;
                drawCircleWithBorder(x, y, color);
                socket.emit("drawCircleWithBorder", roomId, x, y, color);
            })

            //Place game piece to the selected cell
            drawSelected(x, y, playerColor);
            gameboard[row][col].available=false;
            gameboard[row][col].currentColor=playerColor;
            socket.emit("drawSelected", roomId, x, y, playerColor);

            //set the oringinal cell to an empty cell
            let original_col_coor = original_col*CELL_WIDTH;
            let original_row_coor = original_row*CELL_HEIGHT;
            let original_color = gameboard[original_row][original_col].originalColor;

            drawCircleWithBorder(original_col_coor, original_row_coor, original_color);
            socket.emit("drawCircleWithBorder", roomId, original_col_coor, original_row_coor, original_color);

            gameboard[original_row][original_col].available=true;
            gameboard[original_row][original_col].currentColor=gameboard[original_row][original_col].originalColor;
            
            socket.emit("updateGameboard", roomId, gameboard);

            //reset variables
            selected_piece=[row, col];
            allow_single_step=false;
            validNextMoves=[];
            
            let completed = checkCompletion();
            if(completed) return;

            //Player's turn ends if a single step move is made
            if(Math.abs(original_row-row)==1 && Math.abs(original_col-col)==1 ||
                Math.abs(original_row-row)==2 && Math.abs(original_col-col)==0 ||
                Math.abs(original_row-row)==0 && Math.abs(original_col-col)==2){
                    drawCircle(x,y,playerColor);
                    socket.emit("drawCircle", roomId, x, y, playerColor);
                    return
            }
            
            getValidNextMoves();

            if(validNextMoves.length==0){
                drawCircle(x, y, playerColor);
                socket.emit("drawCircle", roomId, x, y, playerColor);
                return;
            }

            showValidNextMoves(validNextMoves, playerColor);
            socket.emit("showValidNextMoves", roomId, validNextMoves, playerColor);
        }
    }
}

function showGameScreen(roomId){
    container_startScreen.style.display="none";
    container_gameScreen.style.display="flex";
    roomidEl.innerHTML=roomId;
}

function generateRandomId(){
    const characters = 'abcdefghijklmnopqrstABCDEFGHIJKLMNOPQRST0123456789';
    const length = 15;
    let randomId='';

    for(let i=0;i<length;i++){
        let randomNumber = Math.floor(Math.random()*characters.length);
        randomId += characters[randomNumber];
    }

    return randomId;
}

/*********************************************************************************************/
/*                     FUNCTIONS - VALID MOVES EVALUATION & CHECK WINNER                     */
/*********************************************************************************************/
function showValidNextMoves(validNextMoves, playerColor){
    if(validNextMoves.length>0){
        validNextMoves.forEach(item=>{
            drawValidMove(item[1]*CELL_WIDTH, item[0]*CELL_HEIGHT, playerColor);
        })
    }
}

function getValidNextMoves(){
    getValidNextMoves_Left();
    getValidNextMoves_BottomRight();
    getValidNextMoves_BottomLeft();
    getValidNextMoves_Right();
    getValidNextMoves_TopLeft();
    getValidNextMoves_TopRight();
}

function getValidNextMoves_Left(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //LEFT (r, c-2)
    if(col-4>=0
        && gameboard[row][col-4].type!="invalid" 
        && gameboard[row][col-4].available
        && !gameboard[row][col-2].available ){

        validNextMoves.push([row, col-4]);
        return;
    }

    if(col-2>=0 && gameboard[row][col-2].available){
        if(allow_single_step) validNextMoves.push([row, col-2]);

        let hop_over = [];
        let i = 4;

        while(col-i>=0){
            if(gameboard[row][col-i].type!="invalid" && gameboard[row][col-i].available==false){
                hop_over[0]=row;
                hop_over[1]=col-i;
                break;
            }
            i=i+2;
        }

        if(hop_over.length!=0){
            let hopsNeeded = Math.abs(hop_over[1]-col);

            for(let k=2;k<=hopsNeeded;k=k+2){
                if(hop_over[1]-k<0 || hop_over[1]-k>=0 && gameboard[row][hop_over[1]-k].available==false) return;
            }
    
            validNextMoves.push([row, hop_over[1]-hopsNeeded]);
        }
    }
}

function getValidNextMoves_Right(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //RIGHT (r, c+2)
    if(col+4<NUM_OF_COLS 
        && gameboard[row][col+4].type!="invalid" 
        && gameboard[row][col+4].available
        && !gameboard[row][col+2].available ){

        validNextMoves.push([row, col+4]);
        return;
    }

    if(col+2<NUM_OF_COLS && gameboard[row][col+2].available){
        if(allow_single_step) validNextMoves.push([row, col+2]);

        let hop_over = [];
        let i=4;

        while(col+i<NUM_OF_COLS){
            if(gameboard[row][col+i].type!="invalid" && gameboard[row][col+i].available==false){
                hop_over[0]=row;
                hop_over[1]=col+i;
                break;
            }
            i=i+2;
        }

        if(hop_over.length!=0){
            let hopsNeeded = Math.abs(hop_over[1]-col);

            for(let k=2;k<=hopsNeeded;k=k+2){
                if(hop_over[1]+k>=NUM_OF_COLS || hop_over[1]+k<NUM_OF_COLS && gameboard[row][hop_over[1]+k].available==false) return;
            }
    
            validNextMoves.push([row, hop_over[1]+hopsNeeded]);
        }
    }

}

function getValidNextMoves_BottomLeft(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //BOTTOM LEFT (r+1, c-1)
    if(row+2<NUM_OF_ROWS && col-2>=0 
        && gameboard[row+2][col-2].type!="invalid" 
        && gameboard[row+2][col-2].available
        && !gameboard[row+1][col-1].available ){

        validNextMoves.push([row+2, col-2]);
        return;
    }

    if(row+1<NUM_OF_ROWS && col-1>=0 && gameboard[row+1][col-1].available){
        if(allow_single_step) validNextMoves.push([row+1, col-1]);

        let hop_over = [];

        for(let i=2, j=2;i<=(NUM_OF_ROWS-row)/2 && j<col/2;i++, j++){            
            if(gameboard[row+i][col-i].available == false && gameboard[row+i][col-i].type != "invalid"){
                hop_over[0]=row+i;
                hop_over[1]=col-i;
                break;
            }
        }

        if(hop_over.length!=0){
            let hopsNeeded = Math.abs(hop_over[1]-col);

            for(let k=1;k<=hopsNeeded;k++){
                if(hop_over[0]+k>=NUM_OF_ROWS 
                    || hop_over[1]-k<0 
                    || gameboard[hop_over[0]+k][hop_over[1]-k].available==false) return;
            }
    
            validNextMoves.push([hop_over[0]+hopsNeeded, hop_over[1]-hopsNeeded]);
        }
    }   
}

function getValidNextMoves_BottomRight(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //BOTTOM RIGHT (r+1, c+1)
    if(row+2<NUM_OF_ROWS && col+2<NUM_OF_COLS 
        && gameboard[row+2][col+2].type!="invalid" 
        && gameboard[row+2][col+2].available
        && !gameboard[row+1][col+1].available){

        validNextMoves.push([row+2, col+2]);
        return;
    }

    if(row+1<NUM_OF_ROWS && col+1<NUM_OF_COLS && gameboard[row+1][col+1].available){
        if(allow_single_step) validNextMoves.push([row+1, col+1]);

        let hop_over = [];

        for(let i=2, j=2;i<=(NUM_OF_ROWS-row)/2 && j<(NUM_OF_COLS-col)/2;i++, j++){            
            if( gameboard[row+i][col+i].available == false && gameboard[row+i][col+i].type != "invalid"){
                hop_over[0]=row+i;
                hop_over[1]=col+i;
                break;
            }
        }

        if(hop_over.length!=0){
            let hopsNeeded = hop_over[1]-col;

            for(let k=1;k<=hopsNeeded;k++){
                if(hop_over[0]+k>=NUM_OF_ROWS 
                    || hop_over[1]+k>=NUM_OF_COLS
                    || gameboard[hop_over[0]+k][hop_over[1]+k].available==false) return;
            }
    
            validNextMoves.push([hop_over[0]+hopsNeeded, hop_over[1]+hopsNeeded]);
        }
    } 
}

function getValidNextMoves_TopLeft(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //TOP LEFT (r-1, c-1)
    if(row-2>=0 && col-2>=0
        && gameboard[row-2][col-2].type!="invalid" 
        && gameboard[row-2][col-2].available
        && !gameboard[row-1][col-1].available ){

        validNextMoves.push([row-2, col-2]);
        return;
    }

    if(row-1>=0 && col-1>=0 && gameboard[row-1][col-1].available){
        if(allow_single_step) validNextMoves.push([row-1, col-1]);

        let hop_over = [];

        for(let i=2, j=2;i<=row/2 && j<col/2;i++, j++){            
            if(gameboard[row-i][col-i].available == false && gameboard[row-i][col-i].type != "invalid"){
                hop_over[0]=row-i;
                hop_over[1]=col-i;
                break;
            }
        }

        if(hop_over.length!=0){
            let hopsNeeded = col-hop_over[1];

            for(let k=1;k<=hopsNeeded;k++){
                if(hop_over[0]-k<0 
                    || hop_over[1]-k<0
                    || gameboard[hop_over[0]-k][hop_over[1]-k].available==false) return;
            }
    
            validNextMoves.push([hop_over[0]-hopsNeeded, hop_over[1]-hopsNeeded]);
        }
    }
}

function getValidNextMoves_TopRight(){
    let row = selected_piece[0];
    let col = selected_piece[1];

    //TOP RIGHT (r-1, c+1)
    if(row-2>=0 && col+2<NUM_OF_COLS 
        && gameboard[row-2][col+2].type!="invalid" 
        && gameboard[row-2][col+2].available
        && !gameboard[row-1][col+1].available ){

        validNextMoves.push([row-2, col+2]);
        return;
    }

    if(row-1>=0 && col+1<NUM_OF_COLS && gameboard[row-1][col+1].available){
        if(allow_single_step) validNextMoves.push([row-1, col+1]);

        let hop_over = [];

        for(let i=2, j=2;i<=row/2 && j<(NUM_OF_COLS-col)/2;i++, j++){            
            if(gameboard[row-i][col+i].available == false && gameboard[row-i][col+i].type != "invalid"){
                hop_over[0]=row-i;
                hop_over[1]=col+i;
                break;
            }
        }

        if(hop_over.length!=0){
            let hopsNeeded = hop_over[1]-col;

            for(let k=1;k<=hopsNeeded;k++){
                if(hop_over[0]-k<0
                    || hop_over[1]+k>=NUM_OF_COLS
                    || gameboard[hop_over[0]-k][hop_over[1]+k].available==false) return;
            }
    
            validNextMoves.push([hop_over[0]-hopsNeeded, hop_over[1]+hopsNeeded]);
        }
    }
}

function checkCompletion(){
    let count = DESTINATION[playerColor].filter(cell=>gameboard[cell[0]][cell[1]].currentColor==playerColor).length;
    if(count==10) socket.emit("completed", roomId, playerId);
    return count==10;
}

/************************************************************************************************/
/*                                  FUNCTIONS - CANVAS DRAWING                                  */
/************************************************************************************************/
function drawGameboard(){
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
