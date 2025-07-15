const dino = document.getElementById("dino");
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("best-score");
const startButton = document.getElementById("start-button");
const message = document.getElementById("message");

const jumpSound = document.getElementById("jump-sound");
const scoreSound = document.getElementById("score-sound");
const gameOverSound = document.getElementById("game-over-sound");
const winSound = document.getElementById("win-sound");

let isJumping = false;
let jumpVelocity = 0;
let gravity = 0.8;
let dinoBottom = 0;

let obstacles = [];
let gameSpeed = 5;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let gameRunning = false;
let obstacleTimer = 0;

bestScoreDisplay.innerText = `Recorde: ${bestScore}`;

startButton.addEventListener("click", startGame);
document.addEventListener("keydown", e => { if(e.code === "Space") jump(); });
document.addEventListener("touchstart", () => { if(gameRunning) jump(); });

function startGame() {
  startButton.style.display = "none";
  message.innerText = "";
  resetGame();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  dinoBottom = 0;
  jumpVelocity = 0;
  isJumping = false;
  dino.style.bottom = dinoBottom + "px";
  score = 0;
  gameSpeed = 5;
  obstacles.forEach(ob => gameArea.removeChild(ob.element));
  obstacles = [];
  scoreDisplay.innerText = `Pontuação: ${score}`;
  message.style.color = "#007700";
}

function jump() {
  if (isJumping) return;
  isJumping = true;
  jumpVelocity = 15;
  jumpSound.currentTime = 0;
  jumpSound.play();
}

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  const heights = [0, 20];
  const randomHeight = heights[Math.floor(Math.random() * heights.length)];
  
  obstacle.style.bottom = randomHeight + "px";
  obstacle.style.right = "-30px";
  gameArea.appendChild(obstacle);

  obstacles.push({ element: obstacle, x: gameArea.clientWidth, y: randomHeight, width: obstacle.offsetWidth, height: obstacle.offsetHeight });
}

function gameLoop() {
  if (!gameRunning) return;

  if (isJumping) {
    dinoBottom += jumpVelocity;
    jumpVelocity -= gravity;
    if (dinoBottom <= 0) {
      dinoBottom = 0;
      isJumping = false;
      jumpVelocity = 0;
    }
    dino.style.bottom = dinoBottom + "px";
  }

  obstacleTimer -= gameSpeed;
  if (obstacleTimer <= 0) {
    createObstacle();
    obstacleTimer = 1500 + Math.random() * 1000;
  }

  for (let i = obstacles.length -1; i >= 0; i--) {
    let ob = obstacles[i];
    ob.x -= gameSpeed;
    if (ob.x + ob.width < 0) {
      gameArea.removeChild(ob.element);
      obstacles.splice(i,1);
      score++;
      scoreDisplay.innerText = `Pontuação: ${score}`;
      scoreSound.currentTime = 0;
      scoreSound.play();

      if(score % 10 === 0){
        gameSpeed += 0.5;
        message.innerText = "Vai Brasil! Mais rápido agora!";
        setTimeout(() => message.innerText = "", 1500);
      }

      if(score === 50){
        message.style.color = "#005500";
        message.innerText = "Parabéns! Você venceu, patriota!";
        winSound.play();
        gameRunning = false;
        startButton.style.display = "block";
        updateBestScore();
        return;
      }
    }
    ob.element.style.right = ob.x + "px";

    if (collision(dino, ob.element)) {
      gameOver();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

function collision(dinoEl, obstacleEl) {
  const dinoRect = dinoEl.getBoundingClientRect();
  const obRect = obstacleEl.getBoundingClientRect();

  return !(
    dinoRect.top > obRect.bottom ||
    dinoRect.bottom < obRect.top ||
    dinoRect.right < obRect.left ||
    dinoRect.left > obRect.right
  );
}

function gameOver() {
  gameRunning = false;
  gameOverSound.play();
  message.style.color = "#aa0000";
  message.innerText = `Game Over! Sua pontuação: ${score}`;
  startButton.style.display = "block";
  updateBestScore();
}

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
    bestScoreDisplay.innerText = `Recorde: ${bestScore}`;
    message.innerText += " Novo recorde! 🇧🇷🔥";
  }
}
