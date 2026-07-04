const express = require("express");
const app = express();

app.use(express.json());

// ======================
// SYMBOLS
// ======================
const symbols = ["⭐","🔔","💎","7","🔥","🐂"];

// ======================
// SLOT ENGINE (5x3 GRID)
// ======================
function spinReels() {
  const grid = [];

  for (let row = 0; row < 3; row++) {
    const line = [];
    for (let col = 0; col < 5; col++) {
      line.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    grid.push(line);
  }

  return grid;
}

// ======================
// WIN SYSTEM
// ======================
function checkWin(grid) {
  const middle = grid[1];
  const first = middle[0];

  if (middle.every(s => s === first)) {
    return 50;
  }

  return 0;
}

// ======================
// BONUS SYSTEM
// ======================
function checkBonus(grid) {
  const flat = grid.flat();
  const fire = flat.filter(s => s === "🔥").length;

  return {
    freeSpins: fire >= 4,
    wheelBonus: fire >= 2
  };
}

// ======================
// NEON RODEO
// ======================
app.post("/play", (req, res) => {
  const reels = spinReels();
  const win = checkWin(reels);
  const bonus = checkBonus(reels);

  res.json({ reels, win, bonus });
});

// ======================
// FIRE LINK (REAL STRUCTURE)
// ======================
app.post("/firelink", (req, res) => {
  const reels = spinReels();
  const fireCount = reels.flat().filter(s => s === "🔥").length;

  res.json({
    reels,
    win: fireCount * 20,
    bonus: {
      freeSpins: fireCount >= 5,
      wheelBonus: fireCount >= 3
    }
  });
});

// ======================
// HUFF & PUFF (REAL STRUCTURE)
// ======================
app.post("/huffpuff", (req, res) => {
  const reels = spinReels();
  const build = reels.flat().filter(s => s === "🐂").length;

  res.json({
    reels,
    win: build * 15,
    bonus: {
      freeSpins: build >= 4,
      wheelBonus: build >= 2
    }
  });
});

// ======================
// FRONTEND (LOBBY + MODERN UI)
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
  background: radial-gradient(circle at top, #1b1f3a, #0b0f1a);
  color: white;
  text-align: center;
}

h1 {
  margin: 20px;
  color: #ff3b6b;
}

.lobby {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
  padding: 20px;
}

.card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 15px;
}

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

.hidden { display: none; }

.reels {
  font-size: 45px;
  margin: 25px 0;
  line-height: 1.6;
}

.win {
  font-size: 18px;
}

.bonus {
  color: gold;
}
</style>
</head>

<body>

<h1>🎰 KWM Casino</h1>

<!-- LOBBY -->
<div id="lobby" class="lobby">

  <div class="card">
    <h3>🎰 Neon Rodeo</h3>
    <button onclick="openGame('play')">Play</button>
  </div>

  <div class="card">
    <h3>🔥 Fire Link</h3>
    <button onclick="openGame('firelink')">Play</button>
  </div>

  <div class="card">
    <h3>🐂 Huff & Puff</h3>
    <button onclick="openGame('huffpuff')">Play</button>
  </div>

</div>

<!-- GAME -->
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
    huffpuff: "🐂 Huff & Puff"
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

  const reelsEl = document.getElementById("reels");
  const winEl = document.getElementById("win");
  const bonusEl = document.getElementById("bonus");

  winEl.innerText = "Spinning...";
  bonusEl.innerText = "";

  // 🎰 START SPIN EFFECT
  reelsEl.classList.add("spinning");

  const symbols = ["⭐","🔔","💎","7","🔥","🐂"];

  // fake spinning animation
  let interval = setInterval(() => {
    reelsEl.innerHTML = Array.from({ length: 3 }, () =>
      Array.from({ length: 5 }, () =>
        symbols[Math.floor(Math.random() * symbols.length)]
      ).join(" ")
    ).join("<br>");
  }, 60);

  // 🎯 STOP AFTER DELAY
  setTimeout(() => {
    clearInterval(interval);

    reelsEl.classList.remove("spinning");

    // show real result
    reelsEl.innerHTML = data.reels
      .map(row => row.join(" "))
      .join("<br>");

    if (data.win > 0) {
      winEl.innerText = "WIN: " + data.win;
      reelsEl.classList.add("winFlash");

      setTimeout(() => {
        reelsEl.classList.remove("winFlash");
      }, 400);
    } else {
      winEl.innerText = "No Win";
    }

    if (data.bonus.freeSpins) {
      bonusEl.innerText = "🔥 FREE SPINS!";
    } else if (data.bonus.wheelBonus) {
      bonusEl.innerText = "🎡 BONUS!";
    } else {
      bonusEl.innerText = "";
    }

  }, 1400);
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
