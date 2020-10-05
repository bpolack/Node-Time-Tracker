// Dependencies
require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const session = require("express-session");
const flash = require('connect-flash');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

// Initialize required constants
const app = express();

// Fix Mongo Client deprication issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Connect to Mongo DB
mongoose.connect( process.env.MONGO_URI )
.then( () => console.log("🥭 MongoDB Connected 🥭") )
.catch( err => console.log("MongoDB Connection Error - " + err) );

// Load mongoose User model
require('./models/User');

// Express Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers: require('./config/handlebars-helpers')
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Express middleware func to set static resources directory
app.use('/static', express.static(__dirname + '/public'));

// Express session middleware
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 //24 hour expiry
    }
}));

// Express Flash Connect Middleware
app.use(flash());

// Body Parser Middleware (form post parsing)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Method Override middleware - override with POST action having ?_method=DELETE
app.use(methodOverride('_method'));

//Passport middleware & passport session middleware
app.use(passport.initialize());
app.use(passport.session());

//Include passport config
require('./config/passport');

//Include routes 
app.use(require('./routes'));

app.listen(process.env.APP_PORT, () => {
    console.log(`Time Tracker server up on port ${process.env.APP_PORT} 🌮`);
});