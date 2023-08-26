const mongodb = require("mongodb");
 
let connection_string = "mongodb+srv://admin:admin@cluster0.z0t9efu.mongodb.net/?retryWrites=true&w=majority";
 
let client = new mongodb.MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); 
 
let db = null
// eksportamo Promise koji resolva na konekciju
export default () => {
    return new Promise((resolve, reject) => {
        // ako smo inicijalizirali bazu i klijent je još uvijek spojen
        if (db) {
            console.log("Database already connected!")
            resolve(db);
        } else {
            try{
                client.connect();
                console.log('Database connected successfully!');
                db = client.db("FavSho");
                resolve(db);
            } catch(e) {
                console.log(e)
                reject('Database not connected! ' + e);
            }
        }
    });
}