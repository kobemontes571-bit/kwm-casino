const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const symbols = ["⭐","🔔","💎","7","🔥","🐂"];

function spin() {
  return [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
}

function checkWin(reels) {
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    return 50;
  }
  return 0;
}

function checkBonus(reels) {
  const fire = reels.filter(s => s === "🔥").length;

  return {
    freeSpins: fire >= 2,
    wheelBonus: fire >= 1
  };
}

app.post("/play", (req, res) => {
  const reels = spin();
  const win = checkWin(reels);
  const bonus = checkBonus(reels);

  res.json({
    reels,
    win,
    bonus,
    state: "base"
  });
});

app.get("/", (req, res) => {
  res.send("KWM Casino API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
