/*******************************************************************************************/
/*                                        CONSTANTS                                        */
/*******************************************************************************************/

// GAMEBOARD STATS
const RADIUS = 13;
const NUM_OF_COLS = 25;
const NUM_OF_ROWS = 17;
const CELL_WIDTH = 28;
const CELL_HEIGHT = 45;

//CELL TYPES
const INVALID = "invalid";
const PLAYER = "player"
const COMMON = "common"

// COLORS & BORDER
const INVALID_CELL = "WHITE";
const COMMON_CELL = "#90ee90"
const AVAILABLE_COLOR = "GRAY"
const PLAYERS = ["RED", "BLACK", "ORANGE", "GREEN", "PURPLE", "BLUE"]
const PLAYERS_COLOR = ["RED", "BLACK", "ORANGE", "GREEN", "PURPLE", "BLUE"];

let SELECTED_PIECE_BORDER_SIZE = 8;
let SELECTED_PIECE_BORDER_COLOR = "#808080";

// DESTINATION
let DESTINATION = {
    BLACK:[[0,12],[1,11],[1,13],[2,10],[2,12],[2,14],[3,9],[3,11],[3,13],[3,15]],
    RED:[[13,9],[13,11],[13,13],[13,15],[14,10],[14,12],[14,14],[15,11],[15,13],[16,12]],
    BLUE:[[4,0],[4,2],[4,4],[4,6],[5,1],[5,3],[5,5],[6,2],[6,4],[7,3]],
    ORANGE:[[9,21],[10,20],[10,22],[11,19],[11,21],[11,23],[12,18],[12,20],[12,22],[12,24]],
    GREEN:[[9,3],[10,2],[10,4],[11,1],[11,3],[11,5],[12,0],[12,2],[12,4],[12,6]],
    PURPLE:[[4,18],[4,20],[4,22],[4,24],[5,19],[5,21],[5,23],[6,20],[6,22],[7,21]]
}


/*******************************************************************************************/
/*                                        DOM ELEMENTS                                     */
/*******************************************************************************************/

// DOM - START SCREEN
const container_startScreen = document.querySelector(".startScreen");

const txt_newRoomId = document.querySelector(".newRoomId");
const input_PlayerName_create = document.querySelector(".input_playerName_create");
const select_numberOfPlayer = document.querySelector(".selectNumberOfPlayers");
const btn_createRoom = document.querySelector(".btn_create");
const txt_errorMessage_create = document.querySelector(".errorMessage_create");

const input_roomId = document.querySelector(".input_roomId");
const txt_roomId = document.querySelector('.input_roomId');
const input_PlayerName_join = document.querySelector(".input_playerName_join");
const btn_joinRoom = document.querySelector(".btn_join");
const txt_errorMessage_join = document.querySelector(".errorMessage_join");

// DOM - GAME SCREEN
const container_gameScreen = document.querySelector(".container");

// DOM - GAME SCREEN - DONE AND RESET BUTTON
const button_done = document.querySelector(".done");
const button_done_text = document.querySelector(".done .currentPlayer");
const button_reset = document.querySelector(".reset");

// DOM - GAME SCREEN - WINNER CONTAINER
let container_winner = document.querySelector(".winner");
let img_winner = document.querySelector(".winner img");

// DOM - GAME SCREEN - CANVAS
const canvas = document.querySelector("#gameboard");
const ctx = canvas.getContext('2d');

ctx.canvas.width = NUM_OF_COLS * CELL_WIDTH;
ctx.canvas.height = NUM_OF_ROWS * CELL_HEIGHT;