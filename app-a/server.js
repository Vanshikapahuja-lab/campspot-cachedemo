const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => res.send("App A is running"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok", app: "app-a" }));

app.listen(PORT, () => console.log(`App A listening on ${PORT}`));
