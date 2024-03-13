// SNAKE GLOBALS //

// colors
let snakeColor;
let appleColor;
let wallColor;

// snake piece size relative to grid size
const snakeSize = 0.9;
// snake eye size relative to snakeSize
const snakeEyeSize = 0.2;
// snake distance from edges of piece relative to snakeSize
const snakeEyeDist = 0.3;

// size of total playing field
const gridSize = 19;

// each "piece" of the snake
let snakePieces = [];

// current direction snake is going
const directions = ["north", "east", "south", "west"];

let currentDirectionIndex = 1;

// current position of the apple
let applePosition;

// function to call when an apple is eaten
let onAppleEatenFunc = () => {};

// set up all p5 globals
function initSnake(){
	snakeColor = color(0, 255, 0);
	appleColor = color(255, 0, 0);
	wallColor = color(0, 0, 255);

	applePosition = createVector(0, 0);
}

// set up globals for a new game
function newSnakeGame(){
	// reset pieces
	snakePieces = [];
	
	// head piece starts in middle
	snakePieces.push(createVector(Math.floor(gridSize / 2), Math.floor(gridSize / 2)));

	// single tail piece, to left of head
	snakePieces.push(createVector(getSnakeHead().x-1, getSnakeHead().y));

	// put apple further ahead
	applePosition = createVector(getSnakeHead().x + 4, getSnakeHead().y);

	// set default direction to east
	currentDirectionIndex = 1;
}

// bind a callback to an apple getting eaten
function onAppleEaten(func){
	onAppleEatenFunc = func;
}

// get the head of the snake
function getSnakeHead(){
	return snakePieces[0];	
}

function getSnakeTail(){
	return snakePieces[snakePieces.length - 1];	
}

function getCurrentDirection(){
	return directions[currentDirectionIndex];	
}

// change snake direction
function changeSnakeDirection(newDirection){
	let n = directions.indexOf(newDirection);

	if(n == -1){
		throw new Error(newDirection + " is not a valid direction");
	}

	// silently forbid turning on self
	if(Math.abs(n - currentDirectionIndex) == 2){
		return;
	}
	
	currentDirectionIndex = n;
}

function moveSnakeHead(){
	let difference = createVector(-1, 0);
	
	if(currentDirectionIndex < 3){
		difference.x = currentDirectionIndex % 2;
		difference.y = currentDirectionIndex - 1;
	}

	// get new position
	const newHeadPos = p5.Vector.add(getSnakeHead(), difference);

	// move head to new head position
	getSnakeHead().set(newHeadPos);
}

function moveApple(){
	// add valid positions to list
	const validPositions = [];

	for(let i = 1; i < gridSize-1; i++){
		for(let j = 1; j < gridSize-1; j++){
			const ap = createVector(i, j);

			let overlap = false;
			
			for(const piece of snakePieces){
				if(piece.equals(ap)){
					overlap = true;
					break;
				}
			}

			if(!overlap){
				validPositions.push(ap);
			}
		}
	}

	// pick random position from valid position
	applePosition = validPositions[Math.floor(Math.random() * validPositions.length)];
}

// moves snake pieces, lengthens snake, checks game over states
function updateSnake(){
	let oldPosition = getSnakeHead().copy();
	let gameOver = false;
	
	// advance head in current direction
	moveSnakeHead();
	
	// check if head is eating apple
	let moveAppleAfterUpdate = false;

	if(getSnakeHead().equals(applePosition)){
		moveAppleAfterUpdate = true;

		// callback
		onAppleEatenFunc();
		
		// lengthen snake by one
		// this is a nonsense position at first, but gets moved to the tail's old position immediately up ahead
		snakePieces.push(createVector(0, 0));
	}
	
	// move other pieces over
	// TODO: more efficient way to handle snake movement
	for(let i = 1; i < snakePieces.length; i++){
		if(getSnakeHead().equals(snakePieces[i])){
			gameOver = true;	
		}
		
		let oldPositionCopy = oldPosition.copy();
		oldPosition = snakePieces[i].copy();
		snakePieces[i].set(oldPositionCopy);
	}

	// check game over conditions
	if(getSnakeHead().x < 1 || getSnakeHead().x > gridSize-2 || getSnakeHead().y < 1 || getSnakeHead().y > gridSize-2){
		gameOver = true;
	}
	
	// move apple now that all segments are updated
	if(moveAppleAfterUpdate) moveApple();
	
	return gameOver;
}

// has two eyes based on current direction
function drawSnakeHead(x, y){
	// first draw snake piece
	drawSnakePiece(x, y);

	// relative to piece size
	let eyePositions = [
		createVector(snakeEyeDist, snakeEyeDist),
		createVector(1 - snakeEyeDist, snakeEyeDist),
		createVector(1 - snakeEyeDist, 1 - snakeEyeDist),
		createVector(snakeEyeDist, 1 - snakeEyeDist)
	];
	
	// draw eyes based on direction
	let leftPosition = eyePositions[currentDirectionIndex];
	let rightPosition = eyePositions[(currentDirectionIndex + 1) % eyePositions.length];
	
	const realCoords = grid2real(x, y);
	const realSize = grid2real(1, 1);
	
	leftPosition.mult(snakeSize);
	leftPosition.mult(realSize);
	leftPosition.add(realCoords);
	leftPosition = floorVector(leftPosition);

	rightPosition.mult(snakeSize);
	rightPosition.mult(realSize);
	rightPosition.add(realCoords);
	rightPosition = floorVector(rightPosition);

	let eyeWidth = snakeEyeSize * snakeSize * realSize.x;
	let eyeHeight = snakeEyeSize * snakeSize * realSize.y;

	eyeWidth = Math.floor(eyeWidth);
	eyeHeight = Math.floor(eyeHeight);
	
	rectMode(CENTER);
	noStroke();
	fill(appleColor);

	rect(leftPosition.x, leftPosition.y, eyeWidth, eyeHeight);
	rect(rightPosition.x, rightPosition.y, eyeWidth, eyeHeight);
}

function drawGridBlock(x, y, c){
	// get real position + size
	let realCoords = grid2real(x, y);
	let realSize = grid2real(1, 1);

	// decrease realSize slightly for visual effect
	realSize.mult(snakeSize);
	
	// floor everything for sharp draw
	realCoords = floorVector(realCoords);
	realSize = floorVector(realSize);

	// draw
	rectMode(CORNER);
	noStroke();
	fill(c);
	rect(realCoords.x, realCoords.y, realSize.x, realSize.y);
}

function drawSnakePiece(x, y){
	drawGridBlock(x, y, snakeColor);
}

function drawApple(){
	drawGridBlock(applePosition.x, applePosition.y, appleColor);
}

function drawSnake(){
	// draw piece by piece
	for(let i = 1; i < snakePieces.length; i++){
		piece = snakePieces[i];
		
		drawSnakePiece(piece.x, piece.y);
	}

	// draw head last so it's always on top
	drawSnakeHead(getSnakeHead().x, getSnakeHead().y);
}

function drawWalls(){
	for(let i = 0; i < 2; i++){
		for(let j = 0; j < gridSize; j++){
			drawGridBlock(j, i*(gridSize-1), wallColor);
		}

		for(let j = 1; j < gridSize-1; j++){
			drawGridBlock(i*(gridSize-1), j, wallColor);
		}
	}
}

// convert grid coords to real coords
function grid2real(x, y){
	const out = createVector(x, y);

	out.x *= width / gridSize;
	out.y *= height / gridSize;

	return out;
}

function floorVector(v){
	return createVector(Math.floor(v.x), Math.floor(v.y));
}

// returns an even canvas size such that grids are spaced evenly
function getOptimalCanvasSize(desired){
	return Math.ceil(desired / gridSize) * gridSize;
}