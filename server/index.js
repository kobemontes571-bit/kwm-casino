const express = require("express");
const app = express();

app.use(express.json());

// serve frontend directly
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
    h1 { color: #ff004c; margin-top: 30px; }
    button {
      padding: 15px 30px;
      font-size: 20px;
      background: #00d4ff;
      border: none;
      border-radius: 10px;
      margin-top: 20px;
    }
    .reels { font-size: 50px; margin-top: 30px; }
    .win { margin-top: 20px; font-size: 22px; }
    .bonus { color: gold; margin-top: 10px; }
  </style>
</head>
<body>

<h1>🎰 KWM Casino</h1>
<p>Neon Rodeo</p>

<div class="reels" id="reels">- - -</div>

<button onclick="spin()">SPIN</button>

<div class="win" id="win"></div>
<div class="bonus" id="bonus"></div>

<script>
async function spin() {
  const res = await fetch('/play', { method: 'POST' });
  const data = await res.json();

  document.getElementById("reels").innerText = data.reels.join(" ");
  document.getElementById("win").innerText = "Win: " + data.win;

  if (data.bonus.freeSpins) {
    document.getElementById("bonus").innerText = "🔥 FREE SPINS!";
  } else if (data.bonus.wheelBonus) {
    document.getElementById("bonus").innerText = "🎡 WHEEL BONUS!";
  } else {
    document.getElementById("bonus").innerText = "";
  }
}
</script>

</body>
</html>
  `);
});

// SLOT ENGINE
function spin() {
  const symbols = ["⭐","🔔","💎","7","🔥","🐂"];
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

// API (used by frontend)
app.post("/play", (req, res) => {
  const reels = spin();
  const win = checkWin(reels);
  const bonus = checkBonus(reels);

  res.json({
    reels,
    win,
    bonus
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("KWM Casino running on", PORT));
