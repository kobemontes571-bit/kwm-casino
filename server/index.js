const express = require("express");
const app = express();

app.use(express.json());

// ======================
// SLOT ENGINE
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
// API
// ======================
app.post("/play", (req, res) => {
  const reels = spinReels();
  const win = checkWin(reels);
  const bonus = checkBonus(reels);

  res.json({ reels, win, bonus });
});

// ======================
// FRONTEND (LOBBY + GAME)
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
  font-family: Arial;
  background: #0b0f1a;
  color: white;
  text-align: center;
}

/* HEADER */
h1 {
  color: #ff004c;
  margin-top: 20px;
}

/* LOBBY CARDS */
.card {
  background: #111;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #333;
}

/* BUTTONS */
button {
  padding: 12px 20px;
  font-size: 16px;
  background: #00d4ff;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
}

/* GAME */
.hidden { display: none; }

.reels {
  font-size: 50px;
  margin-top: 30px;
}

.win {
  margin-top: 20px;
  font-size: 22px;
}

.bonus {
  color: gold;
  margin-top: 10px;
}
</style>
</head>

<body>

<h1>🎰 KWM Casino</h1>

<!-- ================= LOBBY ================= -->
<div id="lobby">
  <div class="card">
    <h2>🎰 Neon Rodeo Slots</h2>
    <p>Classic 3-reel slot machine</p>
    <button onclick="openGame()">Play</button>
  </div>

  <div class="card">
    <h2>🔥 Fire Bonus Wheel</h2>
    <p>Coming soon</p>
    <button disabled>Locked</button>
  </div>
</div>

<!-- ================= GAME ================= -->
<div id="game" class="hidden">
  <h2>🎰 Neon Rodeo</h2>

  <div class="reels" id="reels">🎰 🎰 🎰</div>

  <button onclick="spin()">SPIN</button>

  <div class="win" id="win"></div>
  <div class="bonus" id="bonus"></div>

  <br>
  <button onclick="back()">← Back to Lobby</button>
</div>

<script>
function openGame() {
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}

function back() {
  document.getElementById("game").classList.add("hidden");
  document.getElementById("lobby").classList.remove("hidden");
}

async function spin() {
  const reelsEl = document.getElementById("reels");
  const winEl = document.getElementById("win");
  const bonusEl = document.getElementById("bonus");

  winEl.innerText = "Spinning...";
  bonusEl.innerText = "";

  const res = await fetch('/play', { method: 'POST' });
  const data = await res.json();

  reelsEl.innerText = data.reels.join(" ");

  winEl.innerText = data.win > 0 ? "WIN: " + data.win : "No Win";

  if (data.bonus.freeSpins) {
    bonusEl.innerText = "🔥 FREE SPINS!";
  } else if (data.bonus.wheelBonus) {
    bonusEl.innerText = "🎡 BONUS!";
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
