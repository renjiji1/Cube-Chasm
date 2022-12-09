let ballRadius = 2 * 5;
let ballSpeedY = 10;
let ballSpeedX = 10;
let ballY = 10;
let ballX = 10;

let canvas;
let canvasContext;
var showingWinScreen = false;

let framesPerSecond = 30;
let paddleX = 325;
const PADDLE_WIDTH = 150;
const PADDLE_THICKNESS = 10;
var PADDLE_Y = 725;
var BRICK_W = 80;
var BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;
let brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
let brickCounter = 0;

window.onload = function() {
	canvas = document.getElementById("canvas");
	canvasContext = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	BRICK_W = (canvas.width + BRICK_COLS * BRICK_GAP) / BRICK_COLS;
	BRICK_H = (canvas.height + BRICK_ROWS * BRICK_GAP) / BRICK_ROWS * .4;
	PADDLE_Y = canvas.height * .85;
	

	setInterval(function () {
		drawRect(0, 0, canvas.width, canvas.height, "black");
		if (!showingWinScreen) {
			designEverything();
			moveEverything();
		}	
		Game();
	}, 1000/framesPerSecond);

	canvas.addEventListener('mousemove', function(evt) {
		let mousePos = calculateMousePos(evt);
		paddleX = mousePos.x - (PADDLE_WIDTH/2);
	});
	canvas.addEventListener('touchstart', function (evt) {
		let mousePos = calculateTouchPos(evt);
		paddleX = mousePos.x - (PADDLE_WIDTH / 2);
	}, true);
	canvas.addEventListener('touchmove', function (evt) {
		let mousePos = calculateTouchPos(evt);
		paddleX = mousePos.x - (PADDLE_WIDTH / 2);
	}, true);
	canvas.addEventListener("mousedown", mouseClick)

	resetBricks()
	ballY = canvas.height / 2;
	ballX = canvas.width / 2;
}

function resetBricks() {
	for (let i = 0; i < BRICK_COLS * BRICK_ROWS; i++) {	
		if(i <= 39) {
			brickGrid[i] = false;
		} else {
			brickGrid[i] = true;
			brickCounter++;
		}
	}
}

function drawRect(left, up, width ,height, color) {
	canvasContext.fillStyle = color;
	canvasContext.fillRect(left, up, width, height);
}

function drawCircle(centerX, centerY, radius, color) {
	canvasContext.fillStyle = color;
	canvasContext.beginPath();
	canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
	canvasContext.fill();
}

function drawOverBricks(col, row) {
	let tile = col + BRICK_COLS * row;
	return (brickGrid[tile] == true);
}

function drawBricks() {
	for(let i = 0; i < BRICK_COLS; i++) {
		let brickX = i * BRICK_W;
		for(let j = 0; j < BRICK_ROWS; j++) {
			if(drawOverBricks(i, j) == true) {

				let brickY = j * BRICK_H;

				drawRect(brickX, brickY, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, "blue")	
			}
		}
	}
}

function designEverything() {
	drawBricks()
	drawCircle(ballX, ballY, ballRadius, "red");
	drawRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_THICKNESS, "blue");
}

function moveEverything() {
    romoveBricks(ballX, ballY) 
	if(ballX <= 0) {
		ballSpeedX *= -1;
	}

	else if(ballY < 0) {
		ballSpeedY *= -1;
	}

	if(ballX > canvas.width) {
		ballSpeedX *= -1;
	}

	if(ballY >= canvas.height) {	
	    ballY = canvas.height / 2;
		ballX = canvas.width / 2;
	}

	ballY += ballSpeedY;
	ballX += ballSpeedX;
	if (ballY + 10 >= PADDLE_Y && ballY - 10 <= PADDLE_Y ) {
		if(ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
			let paddleCenter = paddleX + PADDLE_WIDTH / 2;
			let ballDistanceY = ballX - paddleCenter;
			ballSpeedX = ballDistanceY/4;
			ballSpeedY *= -1;
		}
	}
}

function calculateMousePos(evt) {
	let rect = canvas.getBoundingClientRect();
	let root = document.documentElement;
	let mouseX = evt.clientX - rect.left - root.scrollLeft;
	let mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
		x: mouseX,
		y: mouseY
	}
}

function calculateTouchPos(event) {
	let posX = 0, posY = 0;

	if (event.touches && event.touches[0]) {
		posX = event.touches[0].clientX;
		posY = event.touches[0].clientY;
	} else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
		posX = event.originalEvent.changedTouches[0].clientX;
		posY = event.originalEvent.changedTouches[0].clientY;
	} else if (event.clientX && event.clientY) {
		posX = event.clientX;
		posY = event.clientY;
	}

	return {
		x: posX,
		y: posY
	}
}

function brickCord(col, row) {
	return (col + BRICK_COLS * row);
}

function romoveBricks(pixelX, pixelY) {
	let tileCol = Math.floor(pixelX / BRICK_W);
	let tileRow = Math.floor(pixelY / BRICK_H);


	if(tileCol < 0 || tileCol >= BRICK_COLS || tileRow < 0 || tileRow >= BRICK_ROWS) {
		return false;
	}

	let brickIndex = brickCord(tileCol, tileRow);


	if(brickGrid[brickIndex] == true) {
		let prevTileCol = Math.floor((pixelX - ballSpeedX) / BRICK_W);
		let prevTileRow = Math.floor((pixelY - ballSpeedY) / BRICK_H);

		let bothfailed = true;

		if(prevTileCol != tileCol) {
			let adjestent = brickCord(prevTileCol, tileRow)
		    if(brickGrid[adjestent] != true) {
		    	bothfailed = false
				ballSpeedX *= -1;
		    }
		}	
			
		if(prevTileRow != tileRow) {
			let adjestent = brickCord(tileCol, prevTileRow)
			if(brickGrid[adjestent] != true) {
				bothfailed = false
				ballSpeedY *= -1;
		    }
		}

		if(bothfailed == true) {
			ballSpeedY *= -1;
			ballSpeedX *= -1;
		}

		brickGrid[brickIndex] = false;
		brickCounter--
	}
}
function Game() {
	if (brickCounter == 0 || ballY >= canvas.height) {
		showingWinScreen = true;
		if (showingWinScreen == true) {
			canvasContext.fillStyle = "red";
			canvasContext.font = "50px serif";
			canvasContext.textAlign = "center";
			if (brickCounter == 0) {
				canvasContext.fillText("you win!!!", canvas.width / 2, canvas.height / 2)
			}
			else {
				canvasContext.fillText("you are die", canvas.width / 2, canvas.height / 2)
			}
			canvasContext.fillText("click to go back", canvas.width / 2, canvas.height / 2 + 80)
		}
	}
}
function mouseClick(evt) {
	if (showingWinScreen == true) {
		resetBricks();
		ballY = canvas.height / 2;
		showingWinScreen = false;
	}
}
