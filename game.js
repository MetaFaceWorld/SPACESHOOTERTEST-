
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

let bullets = [];
let targets = [];
let powerups = [];
let touchX1 = 0;
let touchX2 = 0;
let roundOver = false;
let roundWinner = null;
let p1Wins = 0;
let p2Wins = 0;
let dodgedTargetsP1 = 0;
let dodgedTargetsP2 = 0;
let p1Shields = 0;
let p2Shields = 0;

const player1 = {
  x: W / 2,
  y: H - 40,
  color: "red",
  lives: 5,
  speed: 3
};

const player2 = {
  x: W / 2,
  y: 40,
  color: "blue",
  lives: 5,
  speed: 3
};

document.addEventListener("touchstart", (e) => {
  for (let t of e.touches) {
    if (t.clientY > H / 2) {
      bullets.push({ x: player1.x, y: player1.y - 10, dy: -5, owner: "p1" });
      touchX1 = t.clientX;
    } else {
      bullets.push({ x: player2.x, y: player2.y + 10, dy: 5, owner: "p2" });
      touchX2 = t.clientX;
    }
  }
});

document.addEventListener("touchmove", (e) => {
  for (let t of e.touches) {
    if (t.clientY > H / 2) {
      player1.x = t.clientX;
    } else {
      player2.x = t.clientX;
    }
  }
});

function drawShip(p) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - 15, p.y + (p.color === "red" ? -20 : 20));
  ctx.lineTo(p.x + 15, p.y + (p.color === "red" ? -20 : 20));
  ctx.closePath();
  ctx.fill();
}

setInterval(() => {
  const angle = Math.random() * 2 * Math.PI;
  const speed = 1.5 + Math.random() * 1.5;
  targets.push({
    x: W / 2,
    y: H / 2,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed
  });
}, 2000);

setInterval(() => {
  const px = W / 2 + (Math.random() * 100 - 50);
  const py = H / 2 + (Math.random() * 100 - 50);
  powerups.push({ x: px, y: py, type: "shield" });
}, 15000);

function update() {
  ctx.clearRect(0, 0, W, H);

  drawShip(player1);
  drawShip(player2);

  bullets.forEach((b, i) => {
    b.y += b.dy;
    ctx.fillStyle = b.owner === "p1" ? "red" : "blue";
    ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
    if (b.y < 0 || b.y > H) bullets.splice(i, 1);
  });

  targets.forEach((t, i) => {
    t.x += t.dx;
    t.y += t.dy;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(t.x, t.y, 6, 0, 2 * Math.PI);
    ctx.fill();

    if (Math.hypot(t.x - player1.x, t.y - player1.y) < 15) {
      if (p1Shields > 0) p1Shields--; else player1.lives--;
      targets.splice(i, 1);
    } else if (Math.hypot(t.x - player2.x, t.y - player2.y) < 15) {
      if (p2Shields > 0) p2Shields--; else player2.lives--;
      targets.splice(i, 1);
    }

    if (t.y > H && t.dy > 0) {
      dodgedTargetsP1++; targets.splice(i, 1);
    } else if (t.y < 0 && t.dy < 0) {
      dodgedTargetsP2++; targets.splice(i, 1);
    }
  });

  bullets.forEach((b, i) => {
    let targetPlayer = b.owner === "p1" ? player2 : player1;
    if (Math.hypot(b.x - targetPlayer.x, b.y - targetPlayer.y) < 15) {
      if (b.owner === "p1" && p2Shields > 0) p2Shields--;
      else if (b.owner === "p1") player2.lives--;
      else if (b.owner === "p2" && p1Shields > 0) p1Shields--;
      else if (b.owner === "p2") player1.lives--;
      bullets.splice(i, 1);
    }
  });

  if (dodgedTargetsP1 >= 10) { p1Shields++; dodgedTargetsP1 = 0; }
  if (dodgedTargetsP2 >= 10) { p2Shields++; dodgedTargetsP2 = 0; }

  powerups.forEach((p, i) => {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
    ctx.fill();

    if (Math.hypot(p.x - player1.x, p.y - player1.y) < 15) {
      if (p.type === "shield") p1Shields++;
      powerups.splice(i, 1);
    } else if (Math.hypot(p.x - player2.x, p.y - player2.y) < 15) {
      if (p.type === "shield") p2Shields++;
      powerups.splice(i, 1);
    }
  });

  if (!roundOver && (player1.lives <= 0 || player2.lives <= 0)) {
    roundOver = true;
    roundWinner = player1.lives > 0 ? "Player 1" : "Player 2";
    if (roundWinner === "Player 1") p1Wins++; else p2Wins++;
    setTimeout(() => {
      player1.lives = 5;
      player2.lives = 5;
      p1Shields = 0;
      p2Shields = 0;
      bullets = [];
      targets = [];
      powerups = [];
      roundOver = false;
    }, 2000);
  }

  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(`P1 Lives: ${player1.lives}`, 10, H - 20);
  ctx.fillText(`P2 Lives: ${player2.lives}`, 10, 30);
  if (p1Shields > 0) ctx.fillText(`🛡️`, player1.x - 5, player1.y - 25);
  if (p2Shields > 0) ctx.fillText(`🛡️`, player2.x - 5, player2.y + 30);
  ctx.fillText(`P1 Wins: ${p1Wins}`, W - 100, H - 20);
  ctx.fillText(`P2 Wins: ${p2Wins}`, W - 100, 30);
  if (roundOver) {
    ctx.fillStyle = "yellow";
    ctx.fillText(`${roundWinner} wins round!`, W / 2 - 70, H / 2);
  }

  requestAnimationFrame(update);
}

update();
