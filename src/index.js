import express from "express";

import mongo from "mongodb";
import connect from "./db.js";
import auth from "./auth";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

const cors = require("cors");
app.use(cors());
app.use(express.json());
// ne možeš pristupiti tajni ako ne prođeš `auth.verify`
// app.get("/tajna", [auth.verify], async (req, res) => {
//   // nakon što se izvrši auth.verify middleware, imamo dostupan req.jwt objekt
//   res.status(200).send("tajna korisnika " + req.jwt.username);
// });

//Registracija
app.post("/korisnik", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.registerUser(user);
    res.status(201).send();
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

//Prijava
app.post("/auth", async (req, res) => {
  let user = req.body;
  let username = user.username;
  let password = user.password;
  try {
    let result = await auth.authenticateUser(username, password);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

// popis serija
app.get('/show', async (req , res) =>{
  let db = await connect();

  let cursor = await db.collection('series').find({});
  let series = await cursor.toArray();
  
  res.json(series);
});

app.listen(port, () => console.log("Slušam na portu: ", port));
