const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI || "mongodb://mongodb:27017/notesdb"
);

const Note = mongoose.model(
  "Note",
  new mongoose.Schema({
    text: String
  })
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const note = await Note.create({
    text: req.body.text
  });

  res.json(note);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});