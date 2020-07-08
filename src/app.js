// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize required constants
const app = express();
const port = 5000;
const dbString = '';

// Fix Mongo Client deprication issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Connect to Mongo DB
mongoose.connect( dbString )
.then( () => console.log("🥭 MongoDB Connected 🥭") )
.catch( err => console.log("MongoDB Connection Error - " + err) );

// Load Mongoose Models


// Express Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers: require('./config/handlebars-helpers')
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Express middleware func to set static resources directory
app.use('/static', express.static(__dirname + '/public'));

// Body Parser Middleware (form post parsing)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Method Override middleware - override with POST action having ?_method=DELETE
app.use(methodOverride('_method'));

//Include routes 
app.use(require('./routes'));

app.listen(port, () => {
    console.log(`Time Tracker server up on port ${port} 🌮`);
});