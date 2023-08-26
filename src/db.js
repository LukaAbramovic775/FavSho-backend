const mongo = require('mongodb');

let connection_string = "mongodb+srv://admin:admin@cluster0.z0t9efu.mongodb.net/?retryWrites=true&w=majority";
let client = new mongo.MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = null;

export default async () => {
    if (db && client.topology.isConnected()) {
        return db;
    } else {
        try {
            await client.connect();
            console.log('Database connected successfully!');
            db = client.db("FavSho");
            return db;
        } catch (err) {
            throw new Error('Spajanje na bazu nije uspjelo: ' + err);
        }
    }
};