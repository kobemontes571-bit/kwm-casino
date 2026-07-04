const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

// SYMBOLS
const symbols = ["⭐","🔔","💎","7","🔥","🐂"];

// SLOT ENGINE
function spinReels() {
  const grid = [];

  for (let r = 0; r < 3; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      row.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    grid.push(row);
  }

  return grid;
}

function checkWin(grid) {
  const middle = grid[1];
  return middle.every(s => s === middle[0]) ? 50 : 0;
}

function checkBonus(grid) {
  const flat = grid.flat();
  const fire = flat.filter(s => s === "🔥").length;

  return {
    freeSpins: fire >= 4,
    wheelBonus: fire >= 2
  };
}

// ROUTES
app.post("/play", (req, res) => {
  const reels = spinReels();
  res.json({
    reels,
    win: checkWin(reels),
    bonus: checkBonus(reels)
  });
});

app.post("/firelink", (req, res) => {
  const reels = spinReels();
  const fire = reels.flat().filter(s => s === "🔥").length;

  res.json({
    reels,
    win: fire * 20,
    bonus: {
      freeSpins: fire >= 5,
      wheelBonus: fire >= 3
    }
  });
});

app.post("/huffpuff", (req, res) => {
  const reels = spinReels();
  const bulls = reels.flat().filter(s => s === "🐂").length;

  res.json({
    reels,
    win: bulls * 15,
    bonus: {
      freeSpins: bulls >= 4,
      wheelBonus: bulls >= 2
    }
  });
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("KWM Casino running on port", PORT);
});
