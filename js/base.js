'use strict';

const GRIDSIZE = 25, MAPWIDTH = 32, MAPHEIGHT = 18, BOMBODDS = 20;
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;

let map, x, y, steps;
let deltax = 0, deltay = 0, xdir = 0, ydir = 0, bombsnum = -1;
let pressed_key = [];
let runTimer;

let $game = document.getElementById('game');
let $player = document.getElementById('player');
let $bombs = document.getElementById('bombs');

let stepSound = document.createElement('audio');
stepSound.setAttribute('src', 'sound/step.mp3');

let splashSound = document.createElement('audio');
splashSound.setAttribute('src', 'sound/splash.mp3');

let candySound = document.createElement('audio');
candySound.setAttribute('src', 'sound/candy.mp3');

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function gridClick(e) {
    if(e.target.className != 'gblank') {
        candySound.pause();
        candySound.currentTime = 0;
        if(candySound.canPlayType("audio/mpeg")) candySound.play();
        e.target.classList.toggle('marked');
    }
}

function createMap() {
    // delete old map
    let oldmap = document.querySelectorAll('#game div[id^="g-"]');
    for(let elem of oldmap) {
        elem.remove();
    }
    // create new map
    map = Array(MAPHEIGHT);
    for(let j = 0; j < MAPHEIGHT; j++) {
        map[j] = Array(MAPWIDTH);
        let blank = (j == 0 || j == (MAPHEIGHT - 1));
        for(let i = 0; i < MAPWIDTH; i++) {
            map[j][i] = 0;
            if(!blank && random(0, 100) < BOMBODDS) map[j][i] = 2;
            let $grid = document.createElement('div');
            $grid.id = 'g-' + (j * MAPWIDTH + i);
            $grid.className = blank ? 'gblank' : 'ghidden ' + ((random(0, 1) < 1) ? 'cc0' : 'cc1');
            $grid.addEventListener('click', gridClick);
            $game.appendChild($grid);
        }
    }
}

function movePlayer() {
	player.style.left = (x * GRIDSIZE + deltax * xdir) + 'px';
	player.style.top = (y * GRIDSIZE + deltay * ydir) + 'px';
}

function delGrid() {
    stepSound.pause();
    stepSound.currentTime = 0;
    if(stepSound.canPlayType("audio/mpeg")) stepSound.play();
    steps++;
    let $grid = document.getElementById('g-' + (y * MAPWIDTH + x));
    if(map[y][x] != 2) $grid.className = 'gblank';
    showBomb(x, y);
}

function showBomb(i, j) {
	let grid = document.getElementById('g-' + (j * 32 + i));
	if(map[j][i] == 2) {
		grid.classList.add('hole');
		if(grid.classList.contains('marked')) {
			grid.classList.remove('marked');
			grid.style.backgroundColor = 'rgba(144, 238, 144, 0.5)';
		}
	}
}

function showBombs() {
	for(let j = 0; j < 18; j++) {
        for(let i = 0; i < 32; i++) {
			showBomb(i, j)
        }
    }
}

function gameOver() {
    stepSound.pause();
    if(splashSound.canPlayType("audio/mpeg")) splashSound.play();
    $player.style.display = 'none';
	showBombs();
	clearInterval(runTimer);
	document.getElementById('gameover').style.display = 'block';
}

function detectWin() {
	if(y == 0) {
		showBombs();
        clearInterval(runTimer);
        document.getElementById('steps').innerText = steps;
		document.getElementById('win').style.display = 'block';
	}
}

function detectBomb() {
	if(map[y][x] == 2) {
		gameOver();
		return false;
	}
	let tb = 0;
	let starty = y - 1;
	if(starty < 0) starty = 0;
	let startx = x - 1;
	if(startx < 0) startx = 0;
	let endy = y + 1;
	if(endy > MAPHEIGHT - 1) endy = MAPHEIGHT - 1;
	let endx = x + 1;
	if(endx > MAPWIDTH - 1) endx = MAPWIDTH - 1;
	for(let j = starty; j < endy + 1; j++) {
		for(let i = startx; i < endx + 1; i++) {
			if(map[j][i] == 2) tb++;
		}
	}
	if(bombsnum != tb) {
		bombsnum = tb;
		$bombs.innerText = bombsnum;
	}
}

function noMoving() {
	return (deltax == 0 && deltay == 0);
}

function run() {
	if(deltax > 0) deltax--; else xdir = 0;
	if(deltay > 0) deltay--; else ydir = 0;
	if(noMoving) {
		detectBomb();
		detectWin();
	}
	if(pressed_key[LEFT] && noMoving() && x > 0) {
		x--;
		deltax = GRIDSIZE;
		xdir = 1;
		delGrid();
	}
	if(pressed_key[RIGHT] && noMoving() && x < MAPWIDTH - 1) {
		x++;
		deltax = GRIDSIZE;
		xdir = -1;
		delGrid();
	}
	if(pressed_key[UP] && noMoving() && y > 0) {
		y--;
		deltay = GRIDSIZE;
		ydir = 1;
		delGrid();
	}
	if(pressed_key[DOWN] && noMoving() && y < MAPHEIGHT - 1) {
		y++;
		deltay = GRIDSIZE;
		ydir = -1;
		delGrid();
	}
	movePlayer();
}

function logKeyDown(e) {
    if(e.key == 'ArrowUp' || e.key == 'w') {
        pressed_key[0] = true;
        e.preventDefault();
    }
    if(e.key == 'ArrowRight' || e.key == 'd') {
        pressed_key[1] = true;
        e.preventDefault();
    }
    if(e.key == 'ArrowDown' || e.key == 's') {
        pressed_key[2] = true;
        e.preventDefault();
    }
    if(e.key == 'ArrowLeft' || e.key == 'a') {
        pressed_key[3] = true;
        e.preventDefault();
    }
}

function logKeyUp(e) {
    if(e.key == 'ArrowUp' || e.key == 'w') {
        pressed_key[0] = false;
        e.preventDefault();
    }
    if(e.key == 'ArrowRight' || e.key == 'd') {
        pressed_key[1] = false;
        e.preventDefault();
    }
    if(e.key == 'ArrowDown' || e.key == 's') {
        pressed_key[2] = false;
        e.preventDefault();
    }
    if(e.key == 'ArrowLeft' || e.key == 'a') {
        pressed_key[3] = false;
        e.preventDefault();
    }
}


function init() {
    deltax = 0, deltay = 0, xdir = 0, ydir = 0, bombsnum = -1, steps = 0;
    document.getElementById('gameover').style.display = 'none';
    document.getElementById('win').style.display = 'none';
    createMap();
    x = Math.round(MAPWIDTH / 2);
    y = MAPHEIGHT - 1;
    movePlayer();
    $player.style.display = 'block';
    document.onkeydown = logKeyDown;
    document.onkeyup = logKeyUp;
    runTimer = setInterval(run, 17); // kb. 60 fps
    detectBomb();
}

init();