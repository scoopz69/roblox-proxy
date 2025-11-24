// server.js

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;

    if (!target || !target.startsWith("https://")) {
      return res.status(400).json({ error: "Invalid URL" });
    }
    if (!target.includes("roblox.com")) {
      return res.status(403).json({ error: "Only Roblox domains allowed" });
    }

    const response = await fetch(target);
    const text = await response.text();

    res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Roblox Proxy running on port", PORT);
});
