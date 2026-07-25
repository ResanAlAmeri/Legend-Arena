const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const playButton = document.getElementById("play-button");
const restartButton = document.getElementById("restart-button");
const backButton = document.getElementById("back-button");

const game = document.getElementById("game");
const hero = document.getElementById("hero");

const coinCounter = document.getElementById("coin-counter");
const totalCoinsDisplay = document.getElementById("total-coins");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const finalScoreDisplay = document.getElementById("final-score");

const healthFill = document.getElementById("health-fill");
const ultimateFill = document.getElementById("ultimate-fill");
const message = document.getElementById("message");

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const dashButton = document.getElementById("dash-button");
const ultimateButton = document.getElementById("ultimate-button");

let heroX = 0;
let heroY = 0;
let lastDirection = 1;

let matchCoins = 0;
let totalCoins =
  Number(localStorage.getItem("legendArenaTotalCoins")) || 0;

let score = 0;
let highScore =
  Number(localStorage.getItem("legendArenaHighScore")) || 0;

let health = 100;
let ultimateCharge = 0;

let gameRunning = false;
let dashReady = true;
let ultimateActive = false;
let invincible = false;

let coinTimer = null;
let enemyTimer = null;
let scoreTimer = null;
let gameLoop = null;

let enemySpawnRate = 4200;
let enemySpeed = 1.15;

const HERO_WIDTH = 54;
const HERO_HEIGHT = 66;
const NORMAL_SPEED = 24;
const DASH_DISTANCE = 95;
const MAX_ENEMIES = 3;

function showScreen(screen) {
  menuScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");

  screen.classList.add("active");
}

function startGame() {
  clearGameTimers();
  clearObjects();

  matchCoins = 0;
  score = 0;
  health = 100;
  ultimateCharge = 0;

  gameRunning = true;
  dashReady = true;
  ultimateActive = false;
  invincible = false;

  enemySpawnRate = 4200;
  enemySpeed = 1.15;

  coinCounter.textContent = matchCoins;
  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  totalCoinsDisplay.textContent = totalCoins;

  dashButton.disabled = false;
  dashButton.textContent = "⚡ DASH";

  ultimateButton.disabled = true;
  ultimateButton.textContent = "🌪️ ULTIMATE 0%";

  updateHealth();
  updateUltimate();

  showScreen(gameScreen);
  resetHero();

  message.textContent =
    "Samla Legend Coins och undvik fiender!";

  coinTimer = setInterval(createCoin, 1250);
  enemyTimer = setInterval(createEnemy, enemySpawnRate);

  scoreTimer = setInterval(() => {
    if (!gameRunning) return;

    score++;
    scoreDisplay.textContent = score;

    if (score % 30 === 0) {
      increaseDifficulty();
    }
  }, 1000);

  gameLoop = requestAnimationFrame(updateGame);
}

function stopGame() {
  gameRunning = false;

  clearGameTimers();
  clearObjects();

  showScreen(menuScreen);
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;

  clearGameTimers();

  if (score > highScore) {
    highScore = score;

    localStorage.setItem(
      "legendArenaHighScore",
      String(highScore)
    );
  }

  totalCoins += matchCoins;

  localStorage.setItem(
    "legendArenaTotalCoins",
    String(totalCoins)
  );

  finalScoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  totalCoinsDisplay.textContent = totalCoins;

  clearObjects();
  showScreen(gameOverScreen);
}

function resetHero() {
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  heroX = gameWidth / 2 - HERO_WIDTH / 2;
  heroY = gameHeight - HERO_HEIGHT - 28;

  updateHeroPosition();
}

function updateHeroPosition() {
  hero.style.left = heroX + "px";
  hero.style.top = heroY + "px";
}

function moveHero(direction) {
  if (!gameRunning) return;

  lastDirection = direction;

  const currentSpeed = ultimateActive
    ? NORMAL_SPEED * 1.7
    : NORMAL_SPEED;

  const maxX = game.clientWidth - HERO_WIDTH;

  heroX += direction * currentSpeed;
  heroX = Math.max(0, Math.min(heroX, maxX));

  updateHeroPosition();
  checkCollisions();
}

function dash() {
  if (!gameRunning || !dashReady) return;

  dashReady = false;
  invincible = true;

  dashButton.disabled = true;
  dashButton.textContent = "LADDAR...";

  hero.classList.add("dashing");

  const maxX = game.clientWidth - HERO_WIDTH;

  heroX += lastDirection * DASH_DISTANCE;
  heroX = Math.max(0, Math.min(heroX, maxX));

  updateHero
