const grid = document.querySelector('.grid');
let cols;
let rows;
const blocks = [];

let snake = [{ x: 1, y: 3 }];
let direction = 'down';
let nextDirection = direction;
let intervalId = null;
let timerIntervalId = null;
let food;

const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const resetButton = document.querySelector('.btn-restart');
const highScoreElement = document.querySelector('#highScore');
const currentScoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');
const bestTimeElement = document.querySelector('#bestTime');
const finalScoreElement = document.querySelector('#finalScore');

let highScore = Number(localStorage.getItem('highScore')) || 0;
let bestTime = Number(localStorage.getItem('bestTime')) || 0;
let score = 0;
let elapsedSeconds = 0;

highScoreElement.innerText = highScore;
timeElement.innerText = '00:00';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

bestTimeElement.innerText = formatTime(bestTime);

function updateTime() {
  elapsedSeconds++;
  timeElement.innerText = formatTime(elapsedSeconds);

  if (elapsedSeconds > bestTime) {
    bestTime = elapsedSeconds;
    localStorage.setItem('bestTime', bestTime.toString());
    bestTimeElement.innerText = formatTime(bestTime);
  }
}

function startTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = setInterval(updateTime, 1000);
}


function buildBoard() {
  const cellSize = Math.max(20, Math.min(60, Math.floor(Math.min(
    grid.clientWidth / 12,
    grid.clientHeight / 12
  ))));
  const nextCols = Math.max(4, Math.floor(grid.clientWidth / cellSize));
  const nextRows = Math.max(4, Math.floor(grid.clientHeight / cellSize));

  if (nextCols === cols && nextRows === rows) return;

  cols = nextCols;
  rows = nextRows;
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
  grid.replaceChildren();
  blocks.length = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = document.createElement('div');
      block.classList.add('block');
      grid.appendChild(block);
      blocks[`${row}-${col}`] = block;
    }
  }

  // Recreate the board state so every position stays inside the resized grid.
  snake = [{ x: 1, y: Math.min(3, cols - 1) }];
  direction = 'down';
  nextDirection = direction;
  placeFood();
  drawSnake();
}

function placeFood() {
  const emptyCells = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!snake.some(segment => segment.x === row && segment.y === col)) {
        emptyCells.push({ x: row, y: col });
      }
    }
  }

  if (emptyCells.length === 0) return;

  food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  blocks[`${food.x}-${food.y}`].classList.add('food');
}

function drawSnake() {
  snake.forEach(segment => {
    blocks[`${segment.x}-${segment.y}`].classList.add('fill');
  });
}

function endGame() {
  clearInterval(intervalId);
  intervalId = null;
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  finalScoreElement.innerText = score;
  modal.style.display = 'flex';
  startGameModal.style.display = 'none';
  gameOverModal.style.display = 'flex';
  resetButton.focus();
}

function render() {
  direction = nextDirection;
  const head = { ...snake[0] };

  if (direction === 'left') head.y--;
  else if (direction === 'right') head.y++;
  else if (direction === 'down') head.x++;
  else if (direction === 'up') head.x--;

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    endGame();
    return;
  }

  const ateFood = head.x === food.x && head.y === food.y;

  
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  if (bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.forEach(segment => {
    blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
  });

  blocks[`${head.x}-${head.y}`].classList.add('fill');
  snake.unshift(head);

  if (ateFood) {
    blocks[`${food.x}-${food.y}`].classList.remove('food');
     score += 10;
  currentScoreElement.innerText = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore.toString());
    highScoreElement.innerText = highScore;
  }
    placeFood();
  } else {
    const tail = snake.pop();
    blocks[`${tail.x}-${tail.y}`].classList.remove('fill');
  }

 
  snake.forEach(segment => {
  blocks[`${segment.x}-${segment.y}`].classList.add('fill');
});

}

function startGame() {
  if (intervalId !== null) return;
  modal.style.display = 'none';
  startTimer();
  intervalId = setInterval(render, 300);
}

function resetGame() {
  clearInterval(intervalId);
  intervalId = null;
  if (food) blocks[`${food.x}-${food.y}`].classList.remove('food');
  snake.forEach(segment => {
    blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
  });

  snake = [{ x: 1, y: 3 }];
  direction = 'down';
  nextDirection = direction;
  score = 0;
  currentScoreElement.innerText = score;
  elapsedSeconds = 0;
  timeElement.innerText = '00:00';
  modal.style.display = 'none';
  drawSnake();
  placeFood();
  startTimer();
  intervalId = setInterval(render, 300);

}

buildBoard();

let resizeTimeoutId;
addEventListener('resize', () => {
  clearTimeout(resizeTimeoutId);
  resizeTimeoutId = setTimeout(buildBoard, 120);
});



startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);

addEventListener('keydown', event => {
  if (intervalId !== null || gameOverModal.style.display !== 'flex') return;
  if (event.key !== 'Enter' && event.code !== 'Space') return;

  // Let the focused restart button handle its own keyboard activation.
  if (document.activeElement === resetButton) return;
  event.preventDefault();
  resetGame();
});

addEventListener('keydown', event => {
  const requestedDirection = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
  }[event.key];

  if (!requestedDirection || intervalId === null) return;

  event.preventDefault();

  const oppositeDirection = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up'
  };

  if (requestedDirection !== oppositeDirection[direction]) {
    nextDirection = requestedDirection;
  }
});
