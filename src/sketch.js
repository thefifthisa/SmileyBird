// overall game
var state = 0;
var gameStarted = false;
var startScreenDelay = 1;
var gamePlayDelay = 1;
var endScreenDelay = 1;

// video capture
var capture;
var capture_w = 250;
var capture_h = 175;

// flappy
var flappy;
var flappy_img;
var flappy_w = 83;
var flappy_h = 50;

// pipes
var pipes = [];
var pipeWidth = 100;
var pipeSpeed = 6;

// scoring
var score = 0;
var lives = 3;
var heart;

// player's lips
var lips = {
	'upperLip' : {'closed':true,  points: [44,45,46,47,48,49,50,59,60,61]},
	'lowerLip' : {'closed':true,  points: [44,55,54,53,52,51,50,58,57,56]}	
};
var maxOpen = 0;
var minOpen = 0;
var minOpenCalibrated = false;
var maxOpenCalibrated = false;

// sounds
var music;
var hit;
var pass;
var on;
var off;

// text
var welcome = 'Welcome to';
var title = 'Smiley Bird!';
var over = 'Game over!';
var welcomeCounter = 0;
var titleCounter = 0;
var overCounter = 0;
var a1 = 0;
var a2 = 0;
var a3 = 0;
var a4 = 0;

function preload() {
	bg = loadImage('src/images/city.jpg');
	flappy_img = loadImage('src/images/flappy.png');
	heart = loadImage('src/images/heart.png');
	on = loadImage('src/images/soundon.png');
	off = loadImage('src/images/soundoff.png');

	music = loadSound('src/sounds/bg.mp3');
	hit = loadSound('src/sounds/lose.mp3');
	pass = loadSound('src/sounds/twinkle.mp3');

	pixelFont = loadFont('src/Pixeled.ttf');
}

function setup() {
	// create canvas and center on page
	var canvas = createCanvas(1200, 600);
	canvas.parent('sketch-holder');
	canvas.style('position', 'absolute');
	canvas.style('left', '0');
	canvas.style('right', '0');
	canvas.style('top', '0');
	canvas.style('bottom', '0');
	canvas.style('margin', 'auto');

	// start video capture
	capture = createCapture(VIDEO);
	capture.size(capture_w, capture_h);
	capture.hide();
	startTrackerFromProcessing(capture);

	// create flappy
	flappy = new Flappy();

	// add starting pipe
	pipes.push(new Pipes());

	// loop music
	music.loop();

	// set font
	textFont(pixelFont);
}

function draw() {
	if (state == 0) {
		gameStart();
	} else if (state == 1) {
		gamePlaying();
	} else if (state == 2) {
		gameOver();
	} else if (state == 3) {
		calibratingMin();
	} else if (state == 4) {
		calibratingMax();
	}
}

function gameStart() {
	// draw background
	imageMode(CORNER);
	image(bg, 0, 0);

	// display volume control button
	imageMode(CENTER);
	if (music.isPlaying()) {
		image(on, width-50, height-50);
	} else {
		image(off, width-50, height-50);
	}

	if (startScreenDelay > 0) {
		if (frameCount % 30 == 0) {
			startScreenDelay--;
		}
	} else {
		noStroke();
		textAlign(CENTER);
		fill(0);
		
		// display text with typewriter and fade effects
		textSize(30);
		if (welcomeCounter < welcome.length) {
			if (frameCount % 5 == 0) {
				welcomeCounter++;
			}
		}
		text(welcome.substring(0, welcomeCounter), width/2, height/2-150);

		if (welcomeCounter >= welcome.length) {
			textSize(100);
			if (titleCounter < title.length) {
				if (frameCount % 5 == 0) {
					titleCounter++;
				}
			}
			text(title.substring(0, titleCounter), width/2, height/2);
		}

		if (titleCounter >= title.length) {
			fill(0, 0, 0, a1);
			textSize(18);
			text('Just smile to move Flappy the Bird :)', width/2, height/2+100);
			if (a1 < 255) { a1 += 5; }
		}

		if (a1 >= 255) {
			fill(144, 75, 106, a2);
			rectMode(CORNER);
			var w = textWidth('Click here to begin');
			rect(width/2-w/2-5, height/2+120, w+5, 40);

			fill(0, 0, 0, a2);
			textSize(18);
			text('Click here to begin', width/2, height/2+150);
			if (a2 < 255) { a2 += 5; }
		}
	}
}

function gamePlaying() {
	// draw background
	imageMode(CORNER);
	image(bg, 0, 0);

	if (gamePlayDelay > 0) {
		if (frameCount % 60 == 0) {
			gamePlayDelay--;
		}
	}
	
	// display pipes
	for (var i = 0; i < pipes.length; i++) {
		pipes[i].display();
		
		if (gamePlayDelay <= 0) {
			pipes[i].scroll();

			// check if flappy collides with pipes or passes
			pipes[i].checkForHit();
			pipes[i].checkForPass();

			// remove pipes when they go off-screen
			if (pipes[i].x < -pipeWidth) {
				pipes.splice(i, 1);
				i--;
			}
		}
	}

	// display score
	noStroke();
	textAlign(LEFT);
	textSize(16);
	fill(0);
	text('Score: ' + score, width-135, 110);

	// display lives as hearts
	imageMode(CENTER);
	if (lives >= 1) { image(heart, width-50, 50); }
	if (lives >= 2) { image(heart, width-110, 50); }
	if (lives == 3) { image(heart, width-170, 50); }

	// display volume control button
	if (music.isPlaying()) {
		image(on, width-50, height-50);
	} else {
		image(off, width-50, height-50);
	}

	// draw video on upper-left corner
	imageMode(CORNER);
	image(capture, 0, 0, capture_w, capture_h);

	// display flappy
	flappy.display();
	
	// get face array
	var faceArray = getFaceArray();
	
	// do we see a face?
	if (faceArray)
	{
		stroke(255, 189, 163);

		// draw lips to guide player
		for (var key in lips)
		{
			var arrayLength = lips[key]['points'].length;
			for (var i = 0; i < arrayLength-1; i++)
			{	
				line(faceArray[ lips[key]['points'][i] ][0], faceArray[ lips[key]['points'][i] ][1], faceArray[ lips[key]['points'][i+1] ][0], faceArray[ lips[key]['points'][i+1] ][1]);					
			}
			
			line(faceArray[ lips[key]['points'][ arrayLength-1 ] ][0], faceArray[ lips[key]['points'][ arrayLength-1 ] ][1], faceArray[ lips[key]['points'][0] ][0], faceArray[ lips[key]['points'][0] ][1]);
		}

		// compute distance between lips
		var openDistance = dist(faceArray[60][0], faceArray[60][1], faceArray[57][0], faceArray[57][1]);
		
		if (gamePlayDelay <= 0) {
			// move flappy based on mouth opening
			flappy.move(openDistance);
		}
	}

	// increase pipe speed after player scores some points
	if (score > 0 && score % 3 == 0) {
		if (score == 3) { pipeSpeed = 9; }
		else { pipeSpeed = score + 3; }
		pipeSpeed = constrain(pipeSpeed, 6, 30);

		console.log(pipeSpeed);

		for (var i = 0; i < pipes.length; i++) {
			if (pipes[i].speed < pipeSpeed) {
				pipes[i].speed = pipeSpeed;
			}
		}
	}

	// game over if player loses all their lives
	if (lives == 0) {
		state = 2;
	}
}

function calibratingMin() {
	// draw background
	imageMode(CORNER);
	image(bg, 0, 0);

	// display volume control button
	imageMode(CENTER);
	if (music.isPlaying()) {
		image(on, width-50, height-50);
	} else {
		image(off, width-50, height-50);
	}

	// translate video capture to center
	push();

		translate(width/2-capture_w/2, height/2-capture_h/2);

		// draw video on upper-left corner
		imageMode(CORNER);
		image(capture, 0, 0, capture_w, capture_h);
		
		// get face array
		var faceArray = getFaceArray();
		
		// do we see a face?
		if (faceArray)
		{
			stroke(255, 189, 163);

			// draw lips to guide player
			for (var key in lips)
			{
				var arrayLength = lips[key]['points'].length;
				for (var i = 0; i < arrayLength-1; i++)
				{	
					line(faceArray[ lips[key]['points'][i] ][0], faceArray[ lips[key]['points'][i] ][1], faceArray[ lips[key]['points'][i+1] ][0], faceArray[ lips[key]['points'][i+1] ][1]);					
				}
				
				line(faceArray[ lips[key]['points'][ arrayLength-1 ] ][0], faceArray[ lips[key]['points'][ arrayLength-1 ] ][1], faceArray[ lips[key]['points'][0] ][0], faceArray[ lips[key]['points'][0] ][1]);
			}

			// compute distance between lips
			var openDistance = dist(faceArray[60][0], faceArray[60][1], faceArray[57][0], faceArray[57][1]);
			minOpen = openDistance;
		}

	pop();

	// calibrate minimum mouth opening (neutral position)
	if (!minOpenCalibrated) {
		noStroke();
		textAlign(CENTER);
		fill(0);
		
		// show guide text
		textSize(18);
		text("Please don't smile!", width/2, height/2-110);

		// show calibration button
		fill(144, 75, 106);
		rectMode(CORNER);
		var w = textWidth('Click here to calibrate');
		rect(width/2-w/2-5, height/2+105, w+5, 40);

		fill(0, 0, 0);
		textSize(18);
		text('Click here to calibrate', width/2, height/2+135);
	} else {
		state = 4;
	}
}

function calibratingMax() {
	// draw background
	imageMode(CORNER);
	image(bg, 0, 0);

	// display volume control button
	imageMode(CENTER);
	if (music.isPlaying()) {
		image(on, width-50, height-50);
	} else {
		image(off, width-50, height-50);
	}

	// translate video capture to center
	push();

		translate(width/2-capture_w/2, height/2-capture_h/2);

		// draw video on upper-left corner
		imageMode(CORNER);
		image(capture, 0, 0, capture_w, capture_h);
		
		// get face array
		var faceArray = getFaceArray();
		
		// do we see a face?
		if (faceArray)
		{
			stroke(255, 189, 163);

			// draw lips to guide player
			for (var key in lips)
			{
				var arrayLength = lips[key]['points'].length;
				for (var i = 0; i < arrayLength-1; i++)
				{	
					line(faceArray[ lips[key]['points'][i] ][0], faceArray[ lips[key]['points'][i] ][1], faceArray[ lips[key]['points'][i+1] ][0], faceArray[ lips[key]['points'][i+1] ][1]);					
				}
				
				line(faceArray[ lips[key]['points'][ arrayLength-1 ] ][0], faceArray[ lips[key]['points'][ arrayLength-1 ] ][1], faceArray[ lips[key]['points'][0] ][0], faceArray[ lips[key]['points'][0] ][1]);
			}

			// compute distance between lips
			var openDistance = dist(faceArray[60][0], faceArray[60][1], faceArray[57][0], faceArray[57][1]);
			maxOpen = openDistance;
		}

	pop();

	// calibrate maximmum mouth opening (full smile)
	if (!maxOpenCalibrated) {
		noStroke();
		textAlign(CENTER);
		fill(0);
		
		// show guide text
		textSize(18);
		text("Please smile wide!", width/2, height/2-110);

		// show calibration button
		fill(144, 75, 106);
		rectMode(CORNER);
		var w = textWidth('Click here to calibrate');
		rect(width/2-w/2-5, height/2+105, w+5, 40);

		fill(0, 0, 0);
		textSize(18);
		text('Click here to calibrate', width/2, height/2+135);
	} else {
		state = 1;
	}
}

function gameOver() {
	// draw background
	imageMode(CORNER);
	image(bg, 0, 0);

	// display volume control button
	imageMode(CENTER);
	if (music.isPlaying()) {
		image(on, width-50, height-50);
	} else {
		image(off, width-50, height-50);
	}

	if (endScreenDelay > 0) {
		if (frameCount % 30 == 0) {
			endScreenDelay--;
		}
	} else {
		noStroke();
		textAlign(CENTER);
		fill(0);

		// display text with typewriter and fade effects
		textSize(100);
		if (overCounter < over.length) {
			if (frameCount % 5 == 0) {
				overCounter++;
			}
		}
		text(over.substring(0, overCounter), width/2, height/2);

		if (overCounter >= over.length) {
			fill(0, 0, 0, a3);
			textSize(18);
			text('Your final score: ' + score, width/2, height/2+100);
			if (a3 < 255) { a3 += 5; }
		}

		if (a3 >= 255) {
			fill(144, 75, 106, a4);
			rectMode(CORNER);
			var w = textWidth('Click here to play again');
			rect(width/2-w/2-5, height/2+120, w+5, 40);

			fill(0, 0, 0, a4);
			textSize(18);
			text('Click here to play again', width/2, height/2+150);
			if (a4 < 255) { a4 += 5; }
		}
	}
}

function mousePressed() {
	// toggle background music
	if (dist(mouseX, mouseY, width-50, height-50) < 25) {
		if (music.isPlaying()) {
			music.pause();
		} else {
			music.loop();
		}
	}

	if (state == 0) {
		// start button clicked
		var w = textWidth('Click here to begin');
		if (mouseX >= width/2-w/2-5 && mouseX <= width/2+w/2 && mouseY >= height/2+120 && mouseY <= height/2+160) {
			state = 3;
		}
	} else if (state == 2) {
		// replay button clicked
		var w = textWidth('Click here to play again');
		if (mouseX >= width/2-w/2-5 && mouseX <= width/2+w/2 && mouseY >= height/2+120 && mouseY <= height/2+160) {
			restart();
			state = 1;
		}
	} else if (state == 3) {
		// calibration button clicked
		var w = textWidth('Click here to calibrate');
		if (mouseX >= width/2-w/2-5 && mouseX <= width/2+w/2 && mouseY >= height/2+105 && mouseY <= height/2+145) {
			minOpenCalibrated = true;
		}
	} else if (state == 4) {
		// calibration button clicked
		var w = textWidth('Click here to calibrate');
		if (mouseX >= width/2-w/2-5 && mouseX <= width/2+w/2 && mouseY >= height/2+105 && mouseY <= height/2+145) {
			maxOpenCalibrated = true;
		}
	}
}

function restart() {
	pipes = [];
	pipeSpeed = 5;
	pipes.push(new Pipes());
	
	score = 0;
	lives = 3;
	
	gamePlayDelay = 1;
	endScreenDelay = 1;

	overCounter = 0;
	a3 = 0;
	a4 = 0;
}



class Flappy {
	constructor() {
		this.x = width/2;
		this.y = height/2;
	}

	move(distance) {
		// make flappy fall down by default
		this.y += 5;

		// change flappy's y-pos based on player's smile
		var smile = map(distance, minOpen, maxOpen, height/2+flappy_h/2+80, height/2-flappy_h-80);
		this.y = smile;
	}

	display() {
		// make sure flappy doesn't go off-screen
		if (this.y < flappy_h/2) {
			this.y = flappy_h/2;
		} else if (this.y > height-flappy_h/2) {
			this.y = height-flappy_h/2;
		}

		// draw flappy to screen
		imageMode(CENTER);
		image(flappy_img, this.x, this.y, flappy_w, flappy_h);
	}
}



class Pipes {
	constructor() {
		this.x = width+pipeWidth;
		this.w = pipeWidth;
		this.h = int(random(200, height/2-flappy_h+15));
		this.speed = pipeSpeed;
		this.past = false;
		this.hit = false;
	}

	display() {
		noStroke();
		fill(33, 48, 67);
		rectMode(CORNER);
		// top pipe
		rect(this.x, 0, this.w, this.h);
		// bottom pipe
		rect(this.x, height-this.h, this.w, this.h);
	}

	scroll() {
		this.x -= this.speed;
	}

	checkForPass() {
		if (!this.past && !this.hit) {
			if (flappy.x-flappy_w/2 > this.x + this.w) {
				this.past = true;
				score++;
				pipes.push(new Pipes());
				if (music.isPlaying()) {
					pass.play();
				}
			}
		}
	}

	checkForHit() {
		if (!this.past && !this.hit) {
			if (flappy.x >= this.x && flappy.x <= this.x + this.w && (flappy.y-flappy_h/2 <= this.h || flappy.y+flappy_h/2 >= height-this.h)) {
				this.hit = true;
				this.past = true;
				lives--;
				pipes.push(new Pipes());
				if (music.isPlaying()) {
					hit.play();
				}
			}
		}
	}
}