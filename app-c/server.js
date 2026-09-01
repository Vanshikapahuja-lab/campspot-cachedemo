const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = process.env.PORT || 3003;

app.get("/", (req, res) => res.send(`App C is running. Request id: ${uuidv4()}`));
app.get("/health", (req, res) => res.status(200).json({ status: "ok", app: "app-c" }));

app.listen(PORT, () => console.log(`App C listening on ${PORT}`));
