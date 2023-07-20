import express from 'express';
import mongo from 'mongodb';
import connect from './db.js';

const app = express() // instanciranje aplikacije
const port = 3000 // port na kojem će web server slušati


// ne možeš pristupiti tajni ako ne prođeš `auth.verify`
app.get('/tajna', [auth.verify], async (req, res) => {
    // nakon što se izvrši auth.verify middleware, imamo dostupan req.jwt objekt
    res.status(200).send('tajna korisnika ' + req.jwt.username);
   });


//Registracija
app.post('/korisnik', async (req , res) =>{
    let userData = req.body;
    let id;
    try{
        id = await Auth.registerUser(userData);
    }
    catch(e){
        res.status(500).json({ error: e.message });
    }

    res.json({ id:id })

});

//Prijava
app.post('/auth', async (req, res) => {
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

