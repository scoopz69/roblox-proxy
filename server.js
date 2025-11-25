const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

const GAMES_BASE = "https://roxytheproxy.com/games.roblox.com";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
};

async function fetchJson(url) {
  const resp = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for ${url}`);
  }

  return await resp.json();
}

app.get("/", (req, res) => {
  res.send("roblox-gamepass-api is running (Roxy)");
});

app.get("/user-gamepasses", async (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    console.log("Fetching gamepasses for user", userId);

    let games = [];
    let cursor = "";

    while (true) {
      const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const url = `${GAMES_BASE}/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Desc${cursorParam}`;

      const data = await fetchJson(url);
      if (!data || !Array.isArray(data.data)) break;

      for (const g of data.data) {
        if (g.id) games.push(g.id);
      }

      if (data.nextPageCursor) {
        cursor = data.nextPageCursor;
      } else {
        break;
      }
    }

    const seen = {};
    const passes = [];

    for (const universeId of games) {
      const url = `${GAMES_BASE}/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`;

      let data;
      try {
        data = await fetchJson(url);
      } catch (err) {
        console.error("Error fetching passes for universe", universeId, ":", err);
        continue;
      }

      if (!data || !Array.isArray(data.data)) continue;

      for (const p of data.data) {
        const id = Number(p.id);
        if (id && !seen[id]) {
          seen[id] = true;
          passes.push(id);
        }
      }
    }

    console.log("User", userId, "has", passes.length, "passes");
    res.json({ passes });
  } catch (err) {
    console.error("Error in /user-gamepasses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`roblox-gamepass-api listening on port ${PORT}`);
});
