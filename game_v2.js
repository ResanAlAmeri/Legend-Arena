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

let matchCoins = 0;
let totalCoins = Number(localStorage.getItem("legendArenaTotalCoins")) || 0;

let score = 0;
let highScore = Number(localStorage.getItem("legendArenaHighScore")) || 0;

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

let enemySpawnRate = 2200;
let enemySpeed = 1.8;

const HERO_WIDTH = 54;
const HERO_HEIGHT = 66;
const NORMAL_SPEED = 24;
const DASH_DISTANCE = 95;

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

  enemySpawnRate = 2200;
  enemySpeed = 1.8;

  coinCounter.textContent = matchCoins;
  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  totalCoinsDisplay.textContent = totalCoins;

  dashButton.textContent = "⚡ DASH";
  ultimateButton.textContent = "🌪️ ULTIMATE";
  ultimateButton.disabled = true;

  updateHealth();
  updateUltimate();
  resetHero();

  message.textContent = "Samla Legend Coins och undvik fiender!";

  showScreen(gameScreen);

  coinTimer = setInterval(createCoin, 1100);
  enemyTimer = setInterval(createEnemy, enemySpawnRate);

  scoreTimer = setInterval(() => {
    if (!gameRunning) return;

    score++;

    scoreDisplay.textContent = score;

    if (score % 15 === 0) {
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
    localStorage.setItem("legendArenaHighScore", highScore);
  }

  totalCoins += matchCoins;
  localStorage.setItem("legendArenaTotalCoins", totalCoins);

  finalScoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  totalCoinsDisplay.textContent = totalCoins;

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

  const currentSpeed = ultimateActive
    ? NORMAL_SPEED * 2
    : NORMAL_SPEED;

  const maxX = game.clientWidth - HERO_WIDTH;

  heroX += direction * currentSpeed;
  heroX = Math.max(0, Math.min(heroX, maxX));

  updateHeroPosition();
  checkCollisions();
}

function clearGameTimers() {
  clearInterval(coinTimer);
  clearInterval(enemyTimer);
  clearInterval(scoreTimer);

  coinTimer = null;
  enemyTimer = null;
  scoreTimer = null;

  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
  }
}

function clearObjects() {
  document
    .querySelectorAll(".coin, .enemy, .effect")
    .forEach((object) => object.remove());
}

function updateGame() {
  if (!gameRunning) return;

  moveEnemiesTowardHero();
  checkCollisions();

  gameLoop = requestAnimationFrame(updateGame);
}

function increaseDifficulty() {
  enemySpeed += 0.18;

  if (enemySpawnRate > 850) {
    enemySpawnRate -= 120;

    clearInterval(enemyTimer);
    enemyTimer = setInterval(createEnemy, enemySpawnRate);
  }

  message.textContent = "Svårighetsgraden ökade!";

  setTimeout(() => {
    if (gameRunning) {
      message.textContent = "Fortsätt kämpa!";
    }
  }, 1000);
}

playButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
backButton.addEventListener("click", stopGame);

leftButton.addEventListener("click", () => moveHero(-1));
rightButton.addEventListener("click", () => moveHero(1));

leftButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveHero(-1);
});

rightButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveHero(1);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    moveHero(-1);
  }

  if (event.key === "ArrowRight") {
    moveHero(1);
  }
});

window.addEventListener("resize", () => {
  if (gameRunning) {
    resetHero();
  }
});

highScoreDisplay.textContent = highScore;
totalCoinsDisplay.textContent = totalCoins;
     function createCoin() {
  if (!gameRunning) return;

  const coin = document.createElement("div");
  coin.className = "coin";

  const maxX = game.clientWidth - 30;
  const coinX = Math.random() * maxX;

  coin.style.left = coinX + "px";
  coin.style.top = "-40px";

  game.appendChild(coin);
}

function createEnemy() {
  if (!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.className = "enemy";

  const maxX = game.clientWidth - 50;
  const enemyX = Math.random() * maxX;

  enemy.style.left = enemyX + "px";
  enemy.style.top = "-70px";

  enemy.dataset.x = enemyX;
  enemy.dataset.y = -70;

  game.appendChild(enemy);
}

function moveEnemiesTowardHero() {
  const enemies = document.querySelectorAll(".enemy");

  enemies.forEach((enemy) => {
    let enemyX = Number(enemy.dataset.x);
    let enemyY = Number(enemy.dataset.y);

    const heroCenterX = heroX + HERO_WIDTH / 2;
    const enemyCenterX = enemyX + enemy.offsetWidth / 2;

    if (enemyCenterX < heroCenterX) {
      enemyX += enemySpeed;
    } else {
      enemyX -= enemySpeed;
    }

    enemyY += enemySpeed * 1.15;

    enemy.dataset.x = enemyX;
    enemy.dataset.y = enemyY;

    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";

    if (enemyY > game.clientHeight + 80) {
      enemy.remove();
    }
  });

  const coinsOnScreen = document.querySelectorAll(".coin");

  coinsOnScreen.forEach((coin) => {
    let coinY = Number(coin.dataset.y || -40);

    coinY += 3.4;

    coin.dataset.y = coinY;
    coin.style.top = coinY + "px";

    if (coinY > game.clientHeight + 40) {
      coin.remove();
    }
  });
}

function checkCollisions() {
  document.querySelectorAll(".coin").forEach((coin) => {
    if (objectsTouch(hero, coin)) {
      collectCoin(coin);
    }
  });

  document.querySelectorAll(".enemy").forEach((enemy) => {
    if (objectsTouch(hero, enemy)) {
      hitEnemy(enemy);
    }
  });
}

function collectCoin(coin) {
  matchCoins++;
  coinCounter.textContent = matchCoins;

  ultimateCharge += 20;
  ultimateCharge = Math.min(100, ultimateCharge);

  updateUltimate();

  createEffect(
    coin.offsetLeft + coin.offsetWidth / 2,
    coin.offsetTop + coin.offsetHeight / 2,
    "+1"
  );

  coin.remove();

  message.textContent = "+1 Legend Coin";

  setTimeout(() => {
    if (gameRunning) {
      message.textContent = "Samla fler Legend Coins!";
    }
  }, 500);
}

function hitEnemy(enemy) {
  if (ultimateActive) {
    createEffect(
      enemy.offsetLeft + enemy.offsetWidth / 2,
      enemy.offsetTop + enemy.offsetHeight / 2,
      "💥"
    );

    score += 5;
    scoreDisplay.textContent = score;

    enemy.remove();
    return;
  }

  if (invincible) return;

  loseHealth(20);

  enemy.remove();
}

function loseHealth(amount) {
  health -= amount;
  health = Math.max(0, health);

  updateHealth();

  hero.classList.add("hit");
  invincible = true;

  message.textContent = "Aero blev träffad!";

  setTimeout(() => {
    hero.classList.remove("hit");
  }, 300);

  setTimeout(() => {
    invincible = false;
  }, 900);

  if (health <= 0) {
    endGame();
  }
}

function updateHealth() {
  healthFill.style.width = health + "%";

  if (health > 60) {
    healthFill.style.background =
      "linear-gradient(90deg, #38d66b, #8dff74)";
  } else if (health > 30) {
    healthFill.style.background =
      "linear-gradient(90deg, #f6c744, #ff9f1c)";
  } else {
    healthFill.style.background =
      "linear-gradient(90deg, #ff4d4d, #b40000)";
  }
}

function updateUltimate() {
  ultimateFill.style.width = ultimateCharge + "%";

  const ready = ultimateCharge >= 100;

  ultimateButton.disabled = !ready;

  if (ready) {
    ultimateButton.textContent = "🌪️ STORM RUSH";
    message.textContent = "Ultimate är redo!";
  } else {
    ultimateButton.textContent =
      "🌪️ ULTIMATE " + ultimateCharge + "%";
  }
}

function objectsTouch(objectA, objectB) {
  const a = objectA.getBoundingClientRect();
  const b = objectB.getBoundingClientRect();

  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function createEffect(x, y, text) {
  const effect = document.createElement("div");

  effect.className = "effect";
  effect.textContent = text;

  effect.style.left = x + "px";
  effect.style.top = y + "px";

  game.appendChild(effect);

  setTimeout(() => {
    effect.remove();
  }, 700);
}
function dash() {
  if (!gameRunning || !dashReady) return;

  dashReady = false;
  invincible = true;

  dashButton.disabled = true;
  dashButton.textContent = "LADDAR...";

  hero.classList.add("dashing");

  const maxX = game.clientWidth - HERO_WIDTH;

  /*
    Dash sker åt höger.
    Senare kan vi förbättra den så att Aero dashar
    åt det håll spelaren senast rörde sig.
  */
  heroX = Math.min(heroX + DASH_DISTANCE, maxX);

  updateHeroPosition();
  checkCollisions();

  setTimeout(() => {
    hero.classList.remove("dashing");

    if (!ultimateActive) {
      invincible = false;
    }
  }, 350);

  setTimeout(() => {
    dashReady = true;
    dashButton.disabled = false;
    dashButton.textContent = "⚡ DASH";
  }, 2500);
}

function activateUltimate() {
  if (
    !gameRunning ||
    ultimateActive ||
    ultimateCharge < 100
  ) {
    return;
  }

  ultimateCharge = 0;
  ultimateActive = true;
  invincible = true;

  updateUltimate();

  hero.classList.add("ultimate-active");
  ultimateButton.disabled = true;
  ultimateButton.textContent = "🌪️ AKTIV";

  message.textContent = "STORM RUSH AKTIVERAD!";

  const magnetTimer = setInterval(() => {
    if (!gameRunning || !ultimateActive) {
      clearInterval(magnetTimer);
      return;
    }

    attractCoinsToHero();
  }, 40);

  setTimeout(() => {
    clearInterval(magnetTimer);

    ultimateActive = false;
    invincible = false;

    hero.classList.remove("ultimate-active");

    updateUltimate();

    if (gameRunning) {
      message.textContent = "Storm Rush är slut!";
    }
  }, 5000);
}

function attractCoinsToHero() {
  const heroCenterX = heroX + HERO_WIDTH / 2;
  const heroCenterY = heroY + HERO_HEIGHT / 2;

  document.querySelectorAll(".coin").forEach((coin) => {
    let coinX = coin.offsetLeft;
    let coinY = Number(coin.dataset.y || coin.offsetTop);

    const coinCenterX = coinX + coin.offsetWidth / 2;
    const coinCenterY = coinY + coin.offsetHeight / 2;

    const differenceX = heroCenterX - coinCenterX;
    const differenceY = heroCenterY - coinCenterY;

    const distance = Math.sqrt(
      differenceX * differenceX +
      differenceY * differenceY
    );

    if (distance < 190 && distance > 0) {
      coinX += (differenceX / distance) * 9;
      coinY += (differenceY / distance) * 9;

      coin.style.left = coinX + "px";
      coin.style.top = coinY + "px";
      coin.dataset.y = coinY;
    }

    if (objectsTouch(hero, coin)) {
      collectCoin(coin);
    }
  });
}

function createHitEffect() {
  hero.classList.add("screen-shake");

  setTimeout(() => {
    hero.classList.remove("screen-shake");
  }, 350);
}

function updateGameOverInformation() {
  finalScoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  totalCoinsDisplay.textContent = totalCoins;
}

dashButton.addEventListener("click", dash);
ultimateButton.addEventListener("click", activateUltimate);

dashButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  dash();
});

ultimateButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  activateUltimate();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    dash();
  }

  if (event.key.toLowerCase() === "u") {
    activateUltimate();
  }
});
let lastDirection = 1;

function moveHero(direction) {
  if (!gameRunning) return;

  lastDirection = direction;

  const currentSpeed = ultimateActive
    ? NORMAL_SPEED * 2
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

  updateHeroPosition();
  checkCollisions();

  setTimeout(() => {
    hero.classList.remove("dashing");

    if (!ultimateActive) {
      invincible = false;
    }
  }, 350);

  setTimeout(() => {
    dashReady = true;
    dashButton.disabled = false;
    dashButton.textContent = "⚡ DASH";
  }, 2500);
}

function loseHealth(amount) {
  if (!gameRunning || invincible) return;

  health -= amount;
  health = Math.max(0, health);

  updateHealth();

  invincible = true;

  hero.classList.add("hit");
  game.classList.add("screen-shake");

  message.textContent = "Aero blev träffad!";

  setTimeout(() => {
    hero.classList.remove("hit");
    game.classList.remove("screen-shake");
  }, 350);

  setTimeout(() => {
    if (!ultimateActive) {
      invincible = false;
    }
  }, 900);

  if (health <= 0) {
    endGame();
  }
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

  message.textContent = "Matchen är slut!";

  clearObjects();
  showScreen(gameOverScreen);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameRunning) {
    gameRunning = false;
    clearGameTimers();

    message.textContent =
      "Spelet pausades när sidan lämnades.";
  }
});
