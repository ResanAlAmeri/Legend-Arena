const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const playButton = document.getElementById("play-button");
const backButton = document.getElementById("back-button");

const game = document.getElementById("game");
const hero = document.getElementById("hero");
const coinCounter = document.getElementById("coin-counter");
const healthFill = document.getElementById("health-fill");
const message = document.getElementById("message");

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const dashButton = document.getElementById("dash-button");

let heroX = 0;
let heroY = 0;
let coins = 0;
let health = 100;
let gameRunning = false;
let dashReady = true;
let coinTimer;
let enemyTimer;

function startGame() {
  menuScreen.classList.remove("active");
  gameScreen.classList.add("active");

  coins = 0;
  health = 100;
  gameRunning = true;

  coinCounter.textContent = coins;
  updateHealth();
  message.textContent = "Samla Legend Coins!";

  resetHero();
  clearObjects();

  coinTimer = setInterval(createCoin, 1200);
  enemyTimer = setInterval(createEnemy, 2200);
}

function stopGame() {
  gameRunning = false;

  clearInterval(coinTimer);
  clearInterval(enemyTimer);

  gameScreen.classList.remove("active");
  menuScreen.classList.add("active");

  clearObjects();
}

function resetHero() {
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  heroX = gameWidth / 2 - 27;
  heroY = gameHeight - 100;

  updateHeroPosition();
}

function updateHeroPosition() {
  hero.style.left = heroX + "px";
  hero.style.top = heroY + "px";
}

function moveHero(direction) {
  if (!gameRunning) return;

  const speed = 24;
  const maxX = game.clientWidth - hero.offsetWidth;

  heroX += direction * speed;
  heroX = Math.max(0, Math.min(heroX, maxX));

  updateHeroPosition();
  checkCollisions();
}

function dash() {
  if (!gameRunning || !dashReady) return;

  dashReady = false;
  dashButton.textContent = "LADDAR...";

  hero.classList.add("dashing");

  const maxX = game.clientWidth - hero.offsetWidth;
  heroX = Math.min(heroX + 90, maxX);

  updateHeroPosition();
  checkCollisions();

  setTimeout(() => {
    hero.classList.remove("dashing");
  }, 250);

  setTimeout(() => {
    dashReady = true;
    dashButton.textContent = "⚡ DASH";
  }, 2500);
}

function createCoin() {
  if (!gameRunning) return;

  const coin = document.createElement("div");
  coin.className = "coin";

  const maxX = game.clientWidth - 30;
  const coinX = Math.random() * maxX;

  coin.style.left = coinX + "px";
  coin.style.top = "-35px";

  game.appendChild(coin);

  let coinY = -35;

  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      coin.remove();
      return;
    }

    coinY += 4;
    coin.style.top = coinY + "px";

    if (objectsTouch(hero, coin)) {
      coins++;
      coinCounter.textContent = coins;
      message.textContent = "+1 Legend Coin";

      clearInterval(fall);
      coin.remove();

      setTimeout(() => {
        if (gameRunning) {
          message.textContent = "Samla fler Legend Coins!";
        }
      }, 500);
    }

    if (coinY > game.clientHeight) {
      clearInterval(fall);
      coin.remove();
    }
  }, 25);
}

function createEnemy() {
  if (!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.className = "enemy";

  const maxX = game.clientWidth - 50;
  const enemyX = Math.random() * maxX;

  enemy.style.left = enemyX + "px";
  enemy.style.top = "-65px";

  game.appendChild(enemy);

  let enemyY = -65;

  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      enemy.remove();
      return;
    }

    enemyY += 3.5;
    enemy.style.top = enemyY + "px";

    if (objectsTouch(hero, enemy)) {
      loseHealth(20);

      clearInterval(fall);
      enemy.remove();
    }

    if (enemyY > game.clientHeight) {
      clearInterval(fall);
      enemy.remove();
    }
  }, 25);
}

function loseHealth(amount) {
  health -= amount;
  health = Math.max(0, health);

  updateHealth();
  message.textContent = "Aero blev träffad!";

  if (health <= 0) {
    endGame();
  }
}

function updateHealth() {
  healthFill.style.width = health + "%";
}

function endGame() {
  gameRunning = false;

  clearInterval(coinTimer);
  clearInterval(enemyTimer);

  message.textContent =
    "Game over! Du samlade " + coins + " Legend Coins.";

  setTimeout(() => {
    stopGame();
  }, 2500);
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

function checkCollisions() {
  document.querySelectorAll(".coin").forEach((coin) => {
    if (objectsTouch(hero, coin)) {
      coins++;
      coinCounter.textContent = coins;
      coin.remove();
    }
  });

  document.querySelectorAll(".enemy").forEach((enemy) => {
    if (objectsTouch(hero, enemy)) {
      loseHealth(20);
      enemy.remove();
    }
  });
}

function clearObjects() {
  document.querySelectorAll(".coin, .enemy").forEach((object) => {
    object.remove();
  });
}

playButton.addEventListener("click", startGame);
backButton.addEventListener("click", stopGame);

leftButton.addEventListener("click", () => moveHero(-1));
rightButton.addEventListener("click", () => moveHero(1));
dashButton.addEventListener("click", dash);

leftButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveHero(-1);
});

rightButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveHero(1);
});

dashButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  dash();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveHero(-1);
  if (event.key === "ArrowRight") moveHero(1);
  if (event.key === " ") dash();
});

window.addEventListener("resize", () => {
  if (gameRunning) {
    resetHero();
  }
});
