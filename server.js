import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const response = await fetch(`https://catalog.roblox.com/v1/search/items?category=GamePass&creatorTargetId=${userId}&creatorType=User&limit=30`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
