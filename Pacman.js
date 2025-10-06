let board;
let context;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;

let blueGhost;
let orangeGhost;
let pinkGhost;
let redGhost;
let pacmanUp;
let pacmanDown;
let pacmanLeft;
let pacmanRight;
let wallImage;

const walls = new Set();
const foods = new Set()
const ghosts = new Set();
let pacman;
let score = 0;
let lifes = 3;
let gameOver = false;

const directions = ['U', 'D', 'L', 'R'];

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXX  XXXX XXXX  XXX",
    "XXX  X       X  XXX",
    "XXX  X XXrXX X  XXX",
    "O       bpo       O",
    "XXX  X XXXXX X  XXX",
    "XXX  X       X  XXX",
    "XXX  X XXXXX X  XXX",
    "X        X        X",
    "X XX X XXXXX X XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
]

function loadImage() {
    wallImage = new Image();
    wallImage.src = "./Images/Wall.png";

    blueGhost = new Image();
    blueGhost.src = "./Images/blueGhost.png";

    orangeGhost = new Image();
    orangeGhost.src = "./Images/orangeGhost.png";

    pinkGhost = new Image();
    pinkGhost.src = "./Images/pinkGhost.png";

    redGhost = new Image();
    redGhost.src = "./Images/redGhost.png";

    pacmanUp = new Image();
    pacmanUp.src = "./Images/pacmanUp.png";

    pacmanDown = new Image();
    pacmanDown.src = "./Images/pacmanDown.png";

    pacmanLeft = new Image();
    pacmanLeft.src = "./Images/pacmanLeft.png";

    pacmanRight = new Image();
    pacmanRight.src = "./Images/pacmanRight.png";
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();

    for(let i = 0; i < rowCount; i++){
        for(let j= 0; j < columnCount; j++){
            const row = tileMap[i];
            const tileMapChar = row[j];

            const x = j * tileSize;
            const y = i * tileSize;

            if(tileMapChar == 'X'){
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall)
            }
            else if(tileMapChar == 'b'){
                const ghost = new Block(blueGhost, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'o'){
                const ghost = new Block(orangeGhost, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'r'){
                const ghost = new Block(redGhost, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'p'){
                const ghost = new Block(pinkGhost, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'P'){
                pacman = new Block(pacmanRight, x, y, tileSize, tileSize);
            }
            else if(tileMapChar == ' '){
                const food = new Block(null, x+14, y+14, 4, 4);
                foods.add(food);
            }
        }
    }
}

function draw(){
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    for(let wall of walls.values()){
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    context.fillStyle = "white";

    for(let food of foods.values()){
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if(gameOver){
        context.fillText("Game Over: " + String(score), tileSize/2, tileSize/2);
    }
    else{
        context.fillText("x" + String(lifes) + " " + String(score), tileSize/2, tileSize/2);
    }
}

function move(){
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for(let wall of walls.values()) {
        if(collision(pacman, wall)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for (let ghost of ghosts.values()){
        if(collision(ghost, pacman)){
            lifes -= 1;
            if( lifes == 0){
                gameOver = true;
                return;
            }
            resetPosition();
        }
        if(ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D'){
            ghost.updateDirection('U')
        }
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        
        for(let wall of walls.values()){
            if(collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth){
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);

            }
        }
       
    }

    let foodEaten = null;
    for(let food of foods.values()){
        if(collision(pacman, food)){
            foodEaten = food;
            score += 10;
            break;
        }


    }
    foods.delete(foodEaten);

    if(foods.size == 0){
        loadMap();
        resetPosition();
    }
}

function movePacman(key){
    if(gameOver){
        loadMap();
        resetPosition();
        lifes = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }

    if(key.code == "ArrowUp" || key.code == "KeyW"){
        pacman.updateDirection('U');
    }
    else if(key.code == "ArrowDown" || key.code == "KeyS"){
        pacman.updateDirection('D');
    }
    else if(key.code == "ArrowLeft" || key.code == "KeyA"){
        pacman.updateDirection('L');
    }
    else if(key.code == "ArrowRight" || key.code == "KeyD"){
        pacman.updateDirection('R');
    }

    if(pacman.direction == 'U'){
        pacman.image = pacmanUp;
    }
    else if(pacman.direction == 'D'){
        pacman.image = pacmanDown;
    }
    else if(pacman.direction == 'L'){
        pacman.image = pacmanLeft;
    }
    else if(pacman.direction == 'R'){
        pacman.image = pacmanRight;
    }
}

function collision(a, b){
    return  a.x < b.x + b.width && a.x + a.width > b.x &&
            a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(){
    if(gameOver){
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}



class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;
        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction){
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()){
            if (collision(this, wall)){
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }

    }

    updateVelocity() {
        if(this.direction == 'U'){
            this.velocityX = 0;
            this.velocityY = -tileSize/4;
        }
        else if(this.direction == 'D'){
            this.velocityX = 0;
            this.velocityY = tileSize/4;
        }
        else if(this.direction == 'L'){
            this.velocityX = -tileSize/4;
            this.velocityY = 0;
        }
        else if(this.direction == 'R'){
            this.velocityX = tileSize/4;
            this.velocityY = 0;
        }
    }

    reset(){
        this.x = this.startX;
        this.y = this.startY;
    }
    
}

function resetPosition(){
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for(let ghost of ghosts.values()){
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
}

window.onload = function() {
    board = this.document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImage();
    loadMap();
    for ( let ghost of ghosts.values()){
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
    update();

    document.addEventListener("keyup", movePacman);
}