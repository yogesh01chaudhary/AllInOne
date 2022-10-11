// import express from "express";
const express = require("express");
require("dotenv/config");
const connect = require("./connection/dbConnection");
const app = express();
const router = require("./routes/login");
const refreshRouter = require("./routes/refreshToken");
const PORT = process.env.PORT;
connect();
app.use(express.json());
app.use("/api/v1", router);
app.use("/api/v1", refreshRouter);

app.get("/", async (req, res) => {
  res.status(200).json({ success: true, message: "Hello Express" });
});
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
