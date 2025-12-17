const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// IMAGENS
const heroImg = new Image();
heroImg.src = "hero.png";

const slimeImg = new Image();
slimeImg.src = "slime.png";

// PLAYER
const player = {
  x: 300,
  y: 220,
  w: 32,
  h: 32,
  speed: 3,
  hp: 100,
  maxHp: 100
};

// CONTROLES
const keys = {};
const bullets = [];
let slimes = [];
let fase = 1;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const dx = mx - player.x;
  const dy = my - player.y;
  const dist = Math.hypot(dx, dy);

  bullets.push({
    x: player.x + player.w / 2,
    y: player.y + player.h / 2,
    vx: (dx / dist) * 6,
    vy: (dy / dist) * 6,
    r: 4
  });
});

// SLIMES
function spawnSlimes() {
  slimes = [];
  for (let i = 0; i < fase + 1; i++) {
    slimes.push({
      x: Math.random() * 600,
      y: Math.random() * 440,
      w: 32,
      h: 32,
      speed: 1 + fase * 0.2
    });
  }
}

// MOVIMENTO
function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
}

function moveSlimes() {
  slimes.forEach(s => {
    const dx = player.x - s.x;
    const dy = player.y - s.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      s.x += (dx / dist) * s.speed;
      s.y += (dy / dist) * s.speed;
    }
  });
}

function moveBullets() {
  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });
}

// COLISÃO
function collide(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// LOOP
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  moveSlimes();
  moveBullets();

  slimes.forEach(s => {
    if (collide(player, s)) player.hp -= 0.3;
  });

  bullets.forEach((b, bi) => {
    slimes.forEach((s, si) => {
      if (b.x > s.x && b.x < s.x + s.w &&
          b.y > s.y && b.y < s.y + s.h) {
        slimes.splice(si, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  if (slimes.length === 0) {
    fase++;
    spawnSlimes();
  }

  ctx.drawImage(heroImg, player.x, player.y, player.w, player.h);
  slimes.forEach(s => ctx.drawImage(slimeImg, s.x, s.y, s.w, s.h));

  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  document.getElementById("fase").innerText = fase;
  document.getElementById("hpBar").style.width =
    (player.hp / player.maxHp * 100) + "%";

  requestAnimationFrame(gameLoop);
}

// START
Promise.all([
  new Promise(r => heroImg.onload = r),
  new Promise(r => slimeImg.onload = r)
]).then(() => {
  spawnSlimes();
  gameLoop();
});
