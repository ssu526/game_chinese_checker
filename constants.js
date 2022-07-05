const CONSTANTS = {
    // GAMEBOARD
    RADIUS: 13,
    NUM_OF_COLS: 25,
    NUM_OF_ROWS: 17,
    CELL_WIDTH: 28,
    CELL_HEIGHT: 45,

    //CELL TYPES
    INVALID: "invalid",
    PLAYER: "player",
    COMMON: "common",


    // COLORS & BORDER
    INVALID_CELL: "WHITE",
    COMMON_CELL: "#90ee90",
    AVAILABLE_COLOR: "GRAY",
    PLAYERS: ["RED", "BLACK", "ORANGE", "GREEN", "PURPLE", "BLUE"],
    PLAYERS_COLOR: ["RED", "BLACK", "ORANGE", "GREEN", "PURPLE", "BLUE"],


    // COMMON ZONE [row, col] <=> [y, x]
    COMMON_ZONE: [
        [4,8],[4,10],[4,12],[4,14],[4,16],
        [5,7],[5,9],[5,11],[5,13],[5,15],[5,17],
        [6,6],[6,8],[6,10],[6,12],[6,14],[6,16], [6,18],
        [7,5],[7,7],[7,9],[7,11],[7,13],[7,15],[7,17],[7,19],
        [8,4],[8,6],[8,8],[8,10],[8,12],[8,14],[8,16],[8,18],[8,20],
        [9,5],[9,7],[9,9],[9,11],[9,13],[9,15],[9,17],[9,19],
        [10,6],[10,8],[10,10],[10,12],[10,14],[10,16], [10,18],
        [11,7],[11,9],[11,11],[11,13],[11,15],[11,17],
        [12,8],[12,10],[12,12],[12,14],[12,16]
    ],

    // ALL PLAYER ZONES [row, col] <=> [y, x]
    PLAYER_ZONES: [
        [[0,12],[1,11],[1,13],[2,10],[2,12],[2,14],[3,9],[3,11],[3,13],[3,15]],  //player RED
        [[13,9],[13,11],[13,13],[13,15],[14,10],[14,12],[14,14],[15,11],[15,13],[16,12]],   //player BLACK
        [[4,0],[4,2],[4,4],[4,6],[5,1],[5,3],[5,5],[6,2],[6,4],[7,3]],   //player YELLOW
        [[4,18],[4,20],[4,22],[4,24],[5,19],[5,21],[5,23],[6,20],[6,22],[7,21]],   //player GREEN
        [[9,3],[10,2],[10,4],[11,1],[11,3],[11,5],[12,0],[12,2],[12,4],[12,6]],   //player PURPLE
        [[9,21],[10,20],[10,22],[11,19],[11,21],[11,23],[12,18],[12,20],[12,22],[12,24]]  //player BLUE
    ],

    // INDIVIDUAL PLAYER ZONE [row, col] <=> [y, x]
    RED_ZONE: [[0,12],[1,11],[1,13],[2,10],[2,12],[2,14],[3,9],[3,11],[3,13],[3,15]],
    BLACK_ZONE: [[13,9],[13,11],[13,13],[13,15],[14,10],[14,12],[14,14],[15,11],[15,13],[16,12]],
    GREEN_ZONE: [[4,18],[4,20],[4,22],[4,24],[5,19],[5,21],[5,23],[6,20],[6,22],[7,21]],
    BLUE_ZONE: [[9,21],[10,20],[10,22],[11,19],[11,21],[11,23],[12,18],[12,20],[12,22],[12,24]],
    ORANGE_ZONE: [[4,0],[4,2],[4,4],[4,6],[5,1],[5,3],[5,5],[6,2],[6,4],[7,3]],
    PURPLE_ZONE: [[9,3],[10,2],[10,4],[11,1],[11,3],[11,5],[12,0],[12,2],[12,4],[12,6]],

    // IMAGES
    IMAGES: {
        BLACK:"./images/black.png",
        GREEN: "./images/green.png",
        ORANGE: "./images/orange.png",
        PURPLE: "./images/purple.png",
        RED: "./images/red.png",
        BLUE: "./images/blue.png",
    },

    // DESTINATIONS
    DESTINATION: {
        BLACK:[[0,12],[1,11],[1,13],[2,10],[2,12],[2,14],[3,9],[3,11],[3,13],[3,15]],
        RED:[[13,9],[13,11],[13,13],[13,15],[14,10],[14,12],[14,14],[15,11],[15,13],[16,12]],
        BLUE:[[4,0],[4,2],[4,4],[4,6],[5,1],[5,3],[5,5],[6,2],[6,4],[7,3]],
        ORANGE:[[9,21],[10,20],[10,22],[11,19],[11,21],[11,23],[12,18],[12,20],[12,22],[12,24]],
        GREEN:[[9,3],[10,2],[10,4],[11,1],[11,3],[11,5],[12,0],[12,2],[12,4],[12,6]],
        PURPLE:[[4,18],[4,20],[4,22],[4,24],[5,19],[5,21],[5,23],[6,20],[6,22],[7,21]]
    }
    
}

module.exports = CONSTANTS;