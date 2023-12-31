import dotenv from 'dotenv';
dotenv.config();
 
import connect from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
 
// Kreiranje indeksa pri pokretanju aplikacije (ukoliko već ne postoji)
(async () => {
  let db = await connect();
  db.collection("users").createIndex({ email: 1 }, { unique: true });
})();
export default {
  async registerUser(userData) {
    let db = await connect();
    let result;
    try {
      let doc = {
        email: userData.email,
        // lozinku ćemo hashirati pomoću bcrypta
        password: await bcrypt.hash(userData.password, 8)
      };
      result = await db.collection("users").insertOne(doc);
    } catch (e) {
        if(e.code == 11000) {
          throw new Error("email already exists");
        } else {
          console.error("Following error occurred: ", e)
        }
    }
      return result.insertedId;
  },
  async authenticateUser(email, password) {
    let db = await connect();
    let user = await db.collection("users").findOne({ email: email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      delete user.password; // ne želimo u tokenu, token se sprema na klijentu
      let token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
 
    return {
      token,
      email: user.email,
    };
    } else {
      throw new Error("Cannot authenticate");
    }
  },
  // express.js middleware function
  verify(req, res, next) {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send(); // HTTP invalid requets
            } else {
                let token = authorization[1];
                // spremi uz upit, verify baca grešku(exception) ako ne uspije
                req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET);
                return next();
            }
        } catch (err) {
            return res.status(401).send(); // HTTP not-authorized
        }
    } else {
        return res.status(401).send(); // HTTP invalid request
    }
},
};