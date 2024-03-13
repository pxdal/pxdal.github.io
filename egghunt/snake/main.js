// DOM ELEMENTS //
const canvas = document.getElementById("main-canvas");
const myScoreElement = document.getElementById("my-score");
const userScoreElement = document.getElementById("your-score");
const currentScoreElement = document.getElementById("current-score");

// GAME GLOBALS //
const myHighScore = 75;
//const myHighScore = 0;
let userHighScore = 0;
let currentScore = 0;

const ticksPerSecond = 6;

const canvasWidth = 600;
const canvasHeight = 600;

let winAnimationStart = -1;
let winSegments;

function setup(){
	createCanvas(getOptimalCanvasSize(canvasWidth), getOptimalCanvasSize(canvasHeight), canvas);

	// set target frame rate to 60 for simplicity
	frameRate(60);
	
	// set initial high score
	updateHighScores(0);

	// initialize snake
	initSnake();
	
	// start new snake game
	newSnakeGame();

	// setup score increment
	onAppleEaten(() => {
		currentScore++;

		updateHighScores(currentScore);
	});

	winSegments = [
		createVector(3, 2, 0),
		createVector(2, 2, 0),
		createVector(1, 3, 0),
		createVector(2, 4, 0),
		createVector(3, 4, 0),
		createVector(4, 5, 0),
		createVector(3, 6, 0),
		createVector(2, 6, 0),
		createVector(7, 2, 0),
		createVector(8, 2, 0),
		createVector(6, 3, 0),
		createVector(6, 4, 0),
		createVector(6, 5, 0),
		createVector(7, 6, 0),
		createVector(8, 6, 0),
		createVector(9, 5, 0),
		createVector(9, 4, 0),
		createVector(9, 3, 0),
		createVector(1, 9, 0),
		createVector(1, 10, 0),
		createVector(1, 11, 0),
		createVector(1, 12, 0),
		createVector(1, 13, 0),
		createVector(2, 13, 0),
		createVector(3, 13, 0),
		createVector(2, 11, 0),
		createVector(2, 9, 0),
		createVector(3, 9, 0),
		createVector(5, 13, 0),
		createVector(5, 11, 0),
		createVector(5, 10, 0),
		createVector(6, 9, 0),
		createVector(7, 10, 0),
		createVector(7, 11, 0),
		createVector(7, 12, 0),
		createVector(7, 13, 0),
		createVector(6, 11, 0),
		createVector(9, 10, 0),
		createVector(10, 9, 0),
		createVector(11, 9, 0),
		createVector(10, 11, 0),
		createVector(11, 11, 0),
		createVector(12, 12, 0),
		createVector(11, 13, 0),
		createVector(10, 13, 0),
		createVector(14, 9, 0),
		createVector(14, 10, 0),
		createVector(16, 9, 0),
		createVector(16, 10, 0),
		createVector(15, 11, 0),
		createVector(15, 12, 0),
		createVector(15, 13, 0),
		createVector(5, 12, 0),
		createVector(3, 11, 0),
	];
}

let tickTimer = 0;
let tickRate = 1 / ticksPerSecond;
let lastTick = 0;
let gameInitialized = true;
let gameIsStarted = false;

let directionInputted = false;
let lastInput = 0;
let cachedInput = 0;

// KEYPRESS HANDLERS //
function keyPressed(){
	// do nothing if win animation has begun
	if(winAnimationStart >= 0) return;
	
	if(lastInput == 0){
		lastInput = keyCode;
	} else {
		cachedInput = keyCode;	
	}

	const isArrow = (keyCode == UP_ARROW || keyCode == RIGHT_ARROW || keyCode == DOWN_ARROW || keyCode == LEFT_ARROW);
	
	if(!isArrow){
		// reset game
		gameIsStarted = false;
		gameInitialized = true;
		newSnakeGame();

		// reset score
		currentScore = 0;

		updateHighScores(0);
		
		directionInputted = false;
		lastInput = 0;		
	}

	return !isArrow;
}

function handleInput(input, isCached){
	// do nothing if win animation has begun
	if(winAnimationStart >= 0) return;
	
	// handle input
	if(input != 0){	
		let inputDirection = "";

		if(input == UP_ARROW){
			inputDirection = "north";
		} else if(input == RIGHT_ARROW) {
			inputDirection = "east";
		} else if(input == DOWN_ARROW) {
			inputDirection = "south";
		} else if(input == LEFT_ARROW) {
			inputDirection = "west";
		}

		// if an arrow key wasn't pressed, space resets
		if(inputDirection != "" && (!directionInputted || isCached)){
			if(gameInitialized && !isCached){
				gameIsStarted = true;
				directionInputted = true;
			}

			changeSnakeDirection(inputDirection);
		}
	}
}

// TEMPORARY CODE //
/*function mousePressed(){
	snapped = createVector(mouseX * (gridSize / canvasWidth), mouseY * (gridSize / canvasWidth));
	snapped = floorVector(snapped);

	let exists = false;

	for(const seg of winSegments){
		if(snapped.equals(seg)){
			exists = true;
			winSegments.splice(winSegments.indexOf(seg), 1);
			break;
		}
	}

	if(!exists){
		winSegments.push(snapped);
	}
}*/

function draw(){
	if(!gameIsStarted && userHighScore > myHighScore){
		if(winAnimationStart < 0) winAnimationStart = (millis() / 1000);
		
		let winAnimationTime = (millis() / 1000) - winAnimationStart;

		// wait a second before doing anything
		if(winAnimationTime < 1){
			
		} else if(winAnimationTime < 2){
			background(0, 0, 0);

			drawWalls();
		} else if(winAnimationTime < 5){
			// rainbow text
			//let r = csin(winAnimationTime*2)*255;
			let r = 0;
			let g = ccos(winAnimationTime*8)*(255/2) + (255/2);
			//let b = csin(winAnimationTime*4)*255;
			let b = 0;
			
			background(0, 0, 0);

			drawWalls();
			
			fill(r, g, b);
			
			textAlign(CENTER);
			textFont('courier new')
			textSize(35);
			text("You unlocked the clue!", canvasWidth/2, canvasHeight/2);
		} else {
			background(0, 0, 0);

			drawWalls();

			for(const seg of winSegments){
				drawSnakePiece(seg.x, seg.y);
			}
		}
		
		// don't allow anything else to happen
		return;
	}

	background(0, 0, 0);
	
	// set cached direction
	/*if(cachedDirection.length > 0 && !directionInputted){
		changeSnakeDirection(cachedDirection);
		cachedDirection = "";
	}*/

	handleInput(lastInput);
	
	// check to update snake element
	if(gameIsStarted){
		if(tickTimer > tickRate){
			let gameOver = updateSnake();

			if(gameOver){
				gameInitialized = false;
				gameIsStarted = false;

				// update scores
				updateHighScores(currentScore);
			}
			
			lastTick += tickTimer;
			tickTimer = 0;
			lastInput = 0;
			directionInputted = false;

			// handle cached input, if any
			handleInput(cachedInput, true);
			cachedInput = 0;
		}
	
		// increment tick timer
		tickTimer = (millis() / 1000) - lastTick;
	} else {
		lastTick = millis() / 1000;
	}
	
	// draw apple
	drawApple();
	
	// draw snake elements
	drawSnake();

	// draw walls
	drawWalls();
}

// GAME UTILS //

// OTHER UTILS //

function updateHighScores(newSelf){
	if(newSelf > userHighScore) userHighScore = newSelf;
	
	myScoreElement.textContent = "My High Score: " + myHighScore;
	userScoreElement.textContent = "Your High Score: " + userHighScore;

	currentScoreElement.textContent = "Score: " + currentScore;
}

function csin(v){
	return correctTrig(Math.sin, v);
}

function ccos(v){
	return correctTrig(Math.cos, v);
}

function correctTrig(func, v){
	return func(v)*0.5 + 0.5;
}

function inverseColor(r,g,b){
	r = 255 - r;
	g = 255 - g;
	b = 255 - b;

	return color(r,g,b);
}