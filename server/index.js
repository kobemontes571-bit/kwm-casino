const express = require("express");
const app = express();

app.use(express.json());

// ======================
// SLOT ENGINE (NEON RODEO)
// ======================
const symbols = ["⭐","🔔","💎","7","🔥","🐂"];

function spinReels() {
  return [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
}

function checkWin(reels) {
  return (reels[0] === reels[1] && reels[1] === reels[2]) ? 50 : 0;
}

function checkBonus(reels) {
  const fire = reels.filter(s => s === "🔥").length;
  return {
    freeSpins: fire >= 2,
    wheelBonus: fire >= 1
  };
}

// ======================
// GAME ROUTES
// ======================

// Neon Rodeo
app.post("/play", (req, res) => {
  const reels = spinReels();
  const win = checkWin(reels);
  const bonus = checkBonus(reels);

  res.json({ reels, win, bonus });
});

// Fire Link (basic prototype)
app.post("/firelink", (req, res) => {
  const reels = ["🔥","🔥","🔥"];
  res.json({
    reels,
    win: 100,
    bonus: { freeSpins: true, wheelBonus: true }
  });
});

// Huff & Puff (basic prototype)
app.post("/huffpuff", (req, res) => {
  const reels = ["🐷","🏠","💨"];
  res.json({
    reels,
    win: 25,
    bonus: { freeSpins: true, wheelBonus: false }
  });
});

// ======================
// FRONTEND (MODERN LOBBY STYLE)
// ======================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>KWM Casino</title>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: radial-gradient(circle at top, #1b1f3a, #0b0f1a);
  color: white;
  text-align: center;
}

/* HEADER */
h1 {
  margin: 20px;
  color: #ff3b6b;
}

/* LOBBY GRID */
.lobby {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
  padding: 20px;
}

/* GAME CARD */
.card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 15px;
  transition: 0.2s;
}

.card:hover {
  transform: scale(1.05);
  border-color: #00d4ff;
}

/* BUTTON */
button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
  background: linear-gradient(90deg, #00d4ff, #7c4dff);
  color: white;
  font-weight: bold;
}

/* GAME AREA */
.hidden { display: none; }

.reels {
  font-size: 55px;
  margin: 30px 0;
}

.win {
  font-size: 20px;
}

.bonus {
  color: gold;
}
</style>
</head>

<body>

<h1>🎰 KWM Casino</h1>

<!-- ================= LOBBY ================= -->
<div id="lobby" class="lobby">

  <div class="card">
    <h3>🎰 Neon Rodeo</h3>
    <p>Classic slot machine</p>
    <button onclick="openGame('play')">Play</button>
  </div>

  <div class="card">
    <h3>🔥 Fire Link</h3>
    <p>Bonus fire game</p>
    <button onclick="openGame('firelink')">Play</button>
  </div>

  <div class="card">
    <h3>🐷 Huff & Puff</h3>
    <p>Bonus building slot</p>
    <button onclick="openGame('huffpuff')">Play</button>
  </div>

</div>

<!-- ================= GAME ================= -->
<div id="game" class="hidden">
  <h2 id="title"></h2>

  <div class="reels" id="reels">🎰 🎰 🎰</div>

  <button onclick="spin()">SPIN</button>

  <div class="win" id="win"></div>
  <div class="bonus" id="bonus"></div>

  <br><br>
  <button onclick="back()">← Back</button>
</div>

<script>
let currentGame = "play";

function openGame(game) {
  currentGame = game;
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  const titles = {
    play: "🎰 Neon Rodeo",
    firelink: "🔥 Fire Link",
    huffpuff: "🐷 Huff & Puff"
  };

  document.getElementById("title").innerText = titles[game];
}

function back() {
  document.getElementById("game").classList.add("hidden");
  document.getElementById("lobby").classList.remove("hidden");
}

async function spin() {
  const res = await fetch('/' + currentGame, { method: 'POST' });
  const data = await res.json();

  document.getElementById("reels").innerText = data.reels.join(" ");
  document.getElementById("win").innerText =
    data.win > 0 ? "WIN: " + data.win : "No Win";

  if (data.bonus.freeSpins) {
    document.getElementById("bonus").innerText = "🔥 FREE SPINS!";
  } else if (data.bonus.wheelBonus) {
    document.getElementById("bonus").innerText = "🎡 BONUS!";
  } else {
    document.getElementById("bonus").innerText = "";
  }
}
</script>

</body>
</html>
  `);
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("KWM Casino running on port", PORT);
});
