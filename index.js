// We store directions as vectors to make movement easier
const Directions = {
    UP: {x: 0, y: -1},
    DOWN: {x: 0, y: 1},
    RIGHT: {x: 1, y: 0},
    LEFT: {x: -1, y: 0}
}

// Snake class
class Snake{
    constructor(){
        this.segments = [{x: 0, y: 0}]; // We store the list of snake segments here
        this.direction = Directions.RIGHT; // We set the initial direction to the right
        this.switchDirection = this.direction; // We use this later to prevent a bug of reversing directions by quickly cycling through directions in 1 frame
    }
    move(){
        // Calculate new head position
        const currentHead = this.segments[0]; 
        let newHead = {};
        newHead.x = currentHead.x + this.direction.x;
        newHead.y = currentHead.y + this.direction.y;

        // Add head to start of list
        this.segments.unshift(newHead);
    }
}

class Apple{
    constructor(game){
        this.location = {};
        this.spawn();
    }
    spawn(){
        // We have to avoid spawning apple on the snake segments
        let validLocation = false;
        while(!validLocation){
            this.location.x = Math.floor(Math.random() * game.gridSize);
            this.location.y = Math.floor(Math.random() * game.gridSize);
            validLocation = true;
            game.snake.segments.forEach((segment) => {
                if(segment.x === this.location.x && segment.y === this.location.y){
                    validLocation = false;
                }
            })
        }
    }   
}

class Game{
    constructor(snake, canvas, scoreEl){
        this.snake = snake;
        this.canvas = canvas;
        this.scoreEl = scoreEl; // Score HTML element

        this.score = 0; // Score counter
        this.ctx = this.canvas.getContext("2d");
        this.cellSize = 20; // How many pixels each cell is
        this.gridSize = 20; // How many cells are in the grid
        this.length = this.cellSize * this.gridSize; // Total width/height in pixels
        this.canvas.width = this.length;
        this.canvas.height = this.length;

        this.fps = 10;
        this.appleImage = document.createElement("img");
        this.appleImage.src = "apple.png";
        this.setupControls();
    }

    setupControls(){
        // arrow keys or w, a, s, d
        document.addEventListener("keydown", (e) => {
            // We make sure to prevent reversing directions and we use switchDirection to prevent quickly cycling through  directions in 1 frame and reversing direction.
            const key = e.key.toLowerCase();
            if ((key === "arrowup" || key === "w") && this.snake.direction !== Directions.DOWN){
                this.snake.switchDirection = Directions.UP;
            }
            else if ((key === "arrowdown" || key === "s") && this.snake.direction !== Directions.UP){
                this.snake.switchDirection = Directions.DOWN;
            }
            else if ((key === "arrowright" || key === "d") && this.snake.direction !== Directions.LEFT){
                this.snake.switchDirection = Directions.RIGHT;
            }
            else if ((key === "arrowleft" || key === "a") && this.snake.direction !== Directions.RIGHT){
                this.snake.switchDirection = Directions.LEFT;
            }
        })
    }

    startGame(){
        // Initialise new snake and apple every time we restart game
        this.snake = new Snake();
        this.apple = new Apple(game);

        // Reset score
        this.score = 0;

        this.intervalID = setInterval(() => {this.gameLoop()}, 1000/this.fps) // since fps is 10, we run gameloop 10 times per second.
    }

    gameLoop(){
        this.snake.direction = this.snake.switchDirection;
        this.snake.move();

        // If head not on apple we remove last segment, if it is on apple we add 1 to score
        const headLocation = this.snake.segments[0];
        const appleLocation = this.apple.location;
        if(headLocation.x !== appleLocation.x || headLocation.y !== appleLocation.y){
            this.snake.segments.pop();
        }
        else{
            this.score++;
            this.apple.spawn();
        }

        // Check collision with self
        for(let i = 1; i < this.snake.segments.length; i++){
            if(headLocation.x === this.snake.segments[i].x && headLocation.y === this.snake.segments[i].y){
                this.loseGame();
                return;
            }
        }

        // If collide with walls: lose
        if(headLocation.x >= this.gridSize || headLocation.x < 0 || headLocation.y >= this.gridSize || headLocation.y < 0){
            this.loseGame();
            return;
        }


        
        this.updateScore();
        this.drawChecker();
        this.renderGrid();
    }

    loseGame(){
        clearInterval(this.intervalID);
        alert(`You got the score: ${this.score}, would you like to restart?`);
        this.startGame();
    }
    
    updateScore(){
        this.scoreEl.innerHTML = `Score: ${this.score}`
    }

    
    renderGrid(){
        // Render snake
        this.ctx.fillStyle = "white"; // white snake
        this.snake.segments.forEach(segment => {
            this.ctx.fillRect(segment.x*this.cellSize, segment.y*this.cellSize, this.cellSize, this.cellSize);
        })

        // Render apple
        const appleLocation = this.apple.location
        this.ctx.drawImage(this.appleImage, appleLocation.x*this.cellSize, appleLocation.y*this.cellSize, this.cellSize, this.cellSize);
    }

    drawChecker(){
        // we draw the canvas checker pattern
        for(let i = 0; i < this.gridSize; i++){
            for(let j = 0; j < this.gridSize; j++){
                if ((i+j) % 2 === 0){
                    this.ctx.fillStyle = "#1e1e1e";
                }
                else{
                    this.ctx.fillStyle = "#232323";
                }
                this.ctx.fillRect(j*this.cellSize, i*this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }
}


const snake = new Snake();
const canvas = document.querySelector("#canvas");
const scoreEl = document.querySelector(".score");
const game = new Game(snake, canvas, scoreEl);
game.startGame();