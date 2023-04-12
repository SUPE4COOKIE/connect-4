//                         ,_     _
//                         |\\_,-~/
//                         / _  _ |    ,--.
//                        (  @  @ )   / ,-'
//                         \  _T_/-._( (
//                         /         `. \
//                        |         _  \ |
//                         \ \ ,  /      |
//                          || |-_\__   /
//                         ((_/`(____,-'
//            Martin Wojtasikiewicz & Yanis Kherouni

width = localStorage.getItem("width") == null ? 7 : parseInt(localStorage.getItem("width")); // Get the width from local storage or set it to default if it doesn't exist
height = localStorage.getItem("height") == null ? 6 : parseInt(localStorage.getItem("height")); // Get the height from local storage or set it to default if it doesn't exist
document.getElementById("width").value = width; // Set the width input to the width
document.getElementById("height").value = height; // Set the height input to the height
const spacebetweenpawns = 10; // define the margin in css for each points
const pawnsize = 60; // define the size of each pawn in css
class Game {
    constructor(width,height,spacebetweenpawns,pawnsize) {
        this.height = height;
        this.width = width;
        this.spacebetweenpawns = spacebetweenpawns;
        this.pawnsize = pawnsize;

        this.Chronometer = new Chronometer(); // Create an instance of the chronometer
        this.board = []; // Create an empty array for the future board
        this.ActivePlayer = 1; // Define the player who will play
        this.pawnbeingplaced = false; // Define if a pawn is being placed (because of async it will avoid being able to place multiple pawns at the same time)
        this.gameover = false; // Define if the game is over
    }
    SwitchPlayer() {
        this.activePlayer = this.activePlayer === 1 ? 2 : 1; // Switch the player
    }
    NewGame() {
        this.Chronometer.reset(); // Reset the chronometer
        this.gameover = false; // Set the gameover to false
        this.board.forEach(column => {
            column.forEach(row => {
                row.style.backgroundColor = "white"; // Set the background color of each tile back to white
            });
        });
        this.ActivePlayer = 1; // Set the active player to default
    }

    InitBoard() {
        /*
        * This function will initialize the board
        */
        //check if localstorage exist if not create it otherwise add a new score (and a coma to separate the scores)
        localStorage.getItem("scores") == null ? localStorage.setItem("scores", "0 - 0") : localStorage.setItem("scores", localStorage.getItem("scores") + "," + "0 - 0");
        this.Chronometer.start();// Start the chronometer
        var board = document.getElementById("board"); // Get the board element to add the tiles
        board.style.width = String(this.width * this.pawnsize + this.spacebetweenpawns * this.width) + "px"; // modify the width of the board to fit the tiles
        board.style.height = String(this.height * this.pawnsize + this.spacebetweenpawns * this.height) + "px";//
        document.documentElement.style.setProperty("--tile-size", String(this.pawnsize) + "px"); // and set it as a css variable

        for(let column = 0; column < this.height ; column++){
            let rows = []; // will contain each tile of the row to add to the board
            for(let row = 0; row < this.width; row++){
                let tile = document.createElement("div"); // create the div for the tile
                tile.className = "tile"; // set the class to tile (to apply the css)
                tile.id = String(column)+ " " + String(row); // set the id to the coordinates of the tile
                tile.addEventListener("click", this.InputTiles.bind(this)); // add the event listener to the tile to place a pawn
                tile.style.backgroundColor = "white"; // set the default background color to white
                document.getElementById("board").appendChild(tile); // add the tile to the board
                rows.push(tile); // add the tile to the row
            }
            this.board.push(rows); // assemble all the rows to form the board
        }
    }
    gravity_pos(tile) {
        /*
        * This function will return the position where the pawn must be placed with gravity applied
        */
        let x = parseInt(tile.id.split(" ")[1]), y = parseInt(tile.id.split(" ")[0]); //split the id to get the coordinates
        for(let i = y; i < this.board.length; i++){
            if(this.board[i][x].style.backgroundColor != "white" && i != y){ // if the tile is not white and it's not the tile we clicked on
                return i - 1; // return the position of the tile above
            }
            
        }
        return this.board.length - 1; // if no tile was found on the way down (we must place it at the bottom)
    }

    InputTiles(event) {
        // check if a pawn is being placed, if the tile is not white or if the game is over
        if(this.pawnbeingplaced || event.target.style.backgroundColor != "white" || this.gameover == true) return;
        // define x and y with the gravity applied
        let x = parseInt(event.target.id.split(" ")[1]),y = this.gravity_pos(event.target);
        // define the color of the pawn based on the active player
        const color = this.activePlayer === 1 ? "yellow" : "red";
        // set the color of the indicator of the pawn being placed
        document.getElementById("pawncolor").style.backgroundColor = color == "yellow" ? "red" : "yellow";
        this.SwitchPlayer(); // switch the players
        // define a function to wait for a certain amount of time wrapped in a promise to know when it's done
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        // define the async function that animate the pawn being placed
        const PlacePawn = async () => {
            this.pawnbeingplaced = true; // set the pawn being placed to true to avoid placing multiple pawns at the same time
            for(let i = -1; i < y; i++){

                await sleep(100); // wait 100ms
                this.board[i + 1][x].style.backgroundColor = color; // set the color of the next tile to the player's color
                if(i != -1) {
                    this.board[i][x].style.backgroundColor = "white"; // and if the tile isn't on the top set the previous tile to white
                }
                
            }
            this.pawnbeingplaced = false; // set the pawn being placed back to false
        }
        PlacePawn(); // execute the function

        if(this.CheckWin(x,y,color)){ // check if the player won
            alert("Player " + this.activePlayer + " won!"); // if so alert the current player that he won
            this.gameover = true; // set the gameover to true to avoid placing more pawns
            this.Chronometer.stop(); // stop the chronometer
            let score = document.getElementById("score").innerHTML.split("-"); // split the scores to get individual score
            // add 1 to the score of the current player and set the score in the html
            document.getElementById("score").innerHTML = this.activePlayer == 1 ? String(parseInt(score[0])+1) + "-" + score[1] : score[0] + "-" + String(parseInt(score[1])+1);
            // update last score in the local storage and check if the localstorage already contains a score to avoid adding a comma at the beginning
            localStorage.getItem("scores").split(",").length > 1 ? localStorage.setItem("scores", localStorage.getItem("scores").split(",").slice(0,-1).join(",") + "," + document.getElementById("score").innerHTML) : localStorage.setItem("scores", localStorage.getItem("scores").split(",").slice(0,-1).join(",") + document.getElementById("score").innerHTML);
        }
    }
    CheckWin(x,y,color) {
        /* check if there's a win in the indicated direction by counting how many consecutive tiles have the same color
        * then add number of consecutive tiles in the indicated direction and the one of the reversed direction 
        *to check if there's a win by inputing a pawn in the middle.
        */

        // check 🡓 
        if(y + 3 < this.board.length) {
            for(let i = 0; i < 4; i++){
                if(this.board[y + i][x].style.backgroundColor != color && i != 0) break;
                if(i == 3) return true;
            }
        }
        let count = 0;
        // check 🡒
        for(let i = 0; x + i < this.width; i++){
            if(this.board[y][x + i].style.backgroundColor != color && i != 0) break;
            count++;
        }
        // check 🡐
        for(let i = 0; x - i >= 0; i++){
            if(this.board[y][x - i].style.backgroundColor != color && i != 0) break;
            count++;
            }
        if(count > 4) return true;
        count = 0;
        // check 🡕
            for(let i = 0; y-i >= 0 && x+i < this.width; i++){
                if(this.board[y - i][x + i].style.backgroundColor != color && i != 0) break;
                count++;
        }
        // check 🡗
        for(let i = 0;y + i < this.height && x - i >= 0; i++){
            if(this.board[y + i][x - i].style.backgroundColor != color && i != 0) break;
            count++;
        }
        if(count > 4) return true;
        count = 0;
        // check 🡔
        for(let i = 0; y - i >= 0 && x - i >= 0; i++){
                if(this.board[y - i][x - i].style.backgroundColor != color && i != 0) break;
                count++;
        }
        // check 🡖
        for(let i = 0; y + i < this.height && x + i < this.width; i++){
                if(this.board[y + i][x + i].style.backgroundColor != color && i != 0) break;
                count++;
        }
        if(count > 4) return true;

    return false;
    
    }


}
class Chronometer {
    constructor() {
      this.minutes = 0;
      this.seconds = 0;
      this.stopped = false; // check if the stop method has been called
      this.intervalId = null; // store the interval id to be able to stop it
    }
    
    // This method will be called every second to update the time
    updateTime() {
      // Increment the seconds
      this.seconds++;
      
      // If the number of seconds reaches 60, increment the minutes and reset the seconds
      if (this.seconds === 60) {
        this.minutes++;
        this.seconds = 0;
      }
      
      // replace #chronometer with time in minutes:seconds format
      if(this.stopped) return;
      document.getElementById("chronometer").innerHTML = this.seconds > 9 ? this.minutes + ":" + this.seconds : this.minutes + ":" +  '0' + this.seconds;
      
    }
    
    // Start the chronometer
    start() {
        this.stopped = false;
      // Set an interval to call the updateTime method every 1000 milliseconds (1 second)
      this.intervalId = setInterval(this.updateTime.bind(this), 1000);
    }
    stop() {
        // set stopped attribute to true to avoid updating the time
        this.stopped = true;
    }
    
    // Reset the chronometer
    reset() {
      this.minutes = 0;
      this.seconds = 0;
      // Clear the interval to stop the chronometer
      clearInterval(this.intervalId);
      // Start the chronometer again
      this.start();
    }
  }


var game = new Game(width,height,spacebetweenpawns,pawnsize); // create a new instance of the game
game.InitBoard(); // initialize the board
// add an event listener to automatically assign the value of the input to the localstorage and reload the page to regenrate the board with those values
document.getElementById("width").addEventListener("change", () => {localStorage.setItem("width", document.getElementById("width").value);window.location.reload();});
document.getElementById("height").addEventListener("change", () => {localStorage.setItem("height", document.getElementById("height").value);window.location.reload();});


