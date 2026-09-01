const express = require("express");
const moment = require("moment");
const app = express();
const PORT = process.env.PORT || 3002;

app.get("/", (req, res) => res.send(`App B is running. Time: ${moment().format()}`));
app.get("/health", (req, res) => res.status(200).json({ status: "ok", app: "app-b" }));

app.listen(PORT, () => console.log(`App B listening on ${PORT}`));
