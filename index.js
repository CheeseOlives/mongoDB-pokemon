require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const { PORT = 3333, MONGODB_URI = "mongodb://127.0.0.1:27017/pokedex" } =
  process.env;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

console.log(`Gotta catch'em all`);

(async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    // console.log("🚀 ~ file: index.js ~ line 21 ~ conn", conn);
    mongoose.connection.on("error", (err) => {
      console.log(err);
    });
  } catch (err) {
    console.log(`Connection error`, err);
  }
})();

app.use((req, res, next) => {
  console.log(req.hostname);
  next();
});

const { Schema } = mongoose;
const pokemonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  mass: {
    type: Number,
    required: true,
  },
});

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

app.get("/api/pokedex", (req, res, next) => {
  Pokemon.find({}).exec((err, pokemon) => {
    if (err) return res.status(500).send(err);

    res.status(200).json(pokemon);
  });
});

app.post("/api/pokedex", (req, res, next) => {
  console.log(req.body);
  const newPokemon = new Pokemon(req.body);

  newPokemon.save((err, pokemon) => {
    if (err) return res.status(500).send(err);
    res.status(201).json(pokemon);
  });
});

app.put("/api/pokedex/:id", (req, res, next) => {
  const pokemonId = req.params.id;
  const updates = req.body;

  Pokemon.updateOne({ _id: pokemonId }, updates, (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.delete("/api/pokedex/:id?", (req, res, next) => {
  console.log(req.params.id);
  const pokemonId = req.params.id;
  Pokemon.deleteOne({ _id: pokemonId }, (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
