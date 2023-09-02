import express from "express";
import mongo from "mongodb";
import connect from "./db.js";
import auth from "./auth";
import cors from "cors";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors({
    origin: ["https://fav-sho-frontend.vercel.app:3000"],
    methods: ["POST", "GET"],
    credentials: true
  }));
app.use(express.json());
// ne možeš pristupiti tajni ako ne prođeš `auth.verify`
app.get("/tajna", [auth.verify], async (req, res) => {
  try {
    // Auth middleware completed successfully
    res.status(200).send("tajna korisnika " + req.jwt.email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Registracija
app.post('/user', async (req , res) =>{
  let userData = req.body;
  let id;
  try{
      id = await auth.registerUser(userData);
  }
  catch(e){
      res.status(500).json({ error: e.message });
  }

  res.json({ id:id })

});

//Prijava
app.post("/login", async (req, res) => {
  let user = req.body;
  let userEmail = user.email 
  let userPassword = user.password 
  try {
    let result = await auth.authenticateUser(userEmail, userPassword);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

//slanje serija
app.post('/series', async (req , res) =>{
  let db = await connect();

  let showData = req.body;

  let result = await db.collection('series').insertOne(showData);
  if (result.insertedCount == 1) {
      res.send({
          status: 'success',
          id: result.insertedId,
      });
  } 
  else {
      res.send({
          status: 'fail',
      });
  }

  console.log(result);

});
// Brisanje serija
app.post("/favourite_series/delete/:id", async (req, res) => {
  let id = req.params.id;
  let db = await connect();
  let result = await db.collection("watchlist").deleteOne({ _id: mongo.ObjectId(id) });
  if (result && result.deletedCount === 1) {
    res.json(result);
  } else {
    res.json({
      status: "crashed",
    });
  }
});

// popis serija
app.get('/series', async (req , res) =>{
  let db = await connect();

  let cursor = await db.collection('series').find();
  let series = await cursor.toArray();
  
  res.json(series);
});

// Popis serija na početnoj
app.get('/', async (req, res) => {
  try {
    let db = await connect();
    let cursor = await db.collection('series').find();
    let series = await cursor.toArray();
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// prikazivanje serija po platformama
app.get('/series/:platform', async (req , res) => {
  let platform = req.params.platform;
  let db = await connect();

  console.log("Platform: ",platform);
  let document = await db.collection('series').find({platform: platform});
  let results = await document.toArray();
  
  res.json(results);
});

// slanje serija na omiljene
app.post('/favourite_series', async (req, res) => {
  let db = await connect();
  let watchlist = req.body;

  try {
    await db.collection('watchlist').createIndex({ user: 1, series: 1 }, { unique: true });

    let result = await db.collection('watchlist').insertOne(watchlist);

    if (result.insertedCount == 1) {
      res.send({
        status: 'success',
        id: result.insertedId,
      });
    } else {
      res.send({
        status: 'crashed',
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.send({
        status: 'crashed',
        message: 'Already added series',
      });
    } else {
      console.error('Error:', error);
      res.send({
        status: 'crashed',
      });
    }
  }
});

// popis serija za korisnike
app.get('/favourite_series/:user', async (req , res) => {
  let user = req.params.user;
  let db = await connect();

  console.log(user)
  let document = await db.collection('watchlist').find({user:user})
  let results = await document.toArray();
  
 
  res.json(results)
});

app.listen(port, () => console.log("Slušam na portu: ", port));
