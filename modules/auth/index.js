const { MongoClient } = require('mongodb');
// Authentication Middleware
function middleware() {
    return async function (req, res, next) {
        log(`${req.id}: Authentication started`);
        const db_url = "mongodb://"+config.database.user+":"+ encodeURIComponent(config.database.password) +"@"+ config.database.host +":"+ config.database.port +"/" + "?ssl=false";
        log(req.id + " Connecting to database: " + db_url);
        // Connect to the db
        const client = new MongoClient(db_url);
        try {
        await client.connect();
        db = await client.db(config.database.database);

        // Check if the user is authenticated
        if (req.header("Authorization") && !req.header("Login")) {
            log(`${req.id}: Authorization header found`);
            // Check if the user session is valid
            const key = await db.collection("sessions").find({"key": req.header("Authorization")}).count();
        
            if (key > 0) { 
            log(`${req.id}: Authentication successful`);
            next();
            } else {
            log(`${req.id}: Authentication failed`);
            next(createError(401)); // Unauthorized
            }
        
        } else if (req.header("Login") && req.path == "/account/login") { // Verify if the user is trying to login and only allow if the path is /account/login
            log(`${req.id}: Login attempt`);	
            next();  
        } else {
            log(`${req.id}: Missing Authentication`);
            next(createError(401)); // Unauthorized
        }
        } catch (err) {
        error("An error ocurred during MongoDB connection/query: " + err);
        next(createError(500)); // Internal Server Error
        } finally {
        await client.close();
        log(req.id + ": Database Connection closed");
        }
        next();
    }
}


module.exports = {
    middleware
}