/*******************************************************************************************/
/*                                        CONSTANTS                                        */
/*******************************************************************************************/
const RADIUS = 13;
const NUM_OF_COLS = 25;
const NUM_OF_ROWS = 17;
const CELL_WIDTH = 28;
const CELL_HEIGHT = 45;
const INVALID = "invalid";
const PLAYER = "player"
const COMMON = "common"
const INVALID_CELL = "WHITE";


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
const roomidEl = document.querySelector(".gameboard-roomid")
const waitingEl = document.querySelector(".waiting");
const game_message = document.querySelector(".game_message");

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
const canvas_container = document.querySelector(".canvas_container");

ctx.canvas.width = NUM_OF_COLS * CELL_WIDTH;
ctx.canvas.height = NUM_OF_ROWS * CELL_HEIGHT;