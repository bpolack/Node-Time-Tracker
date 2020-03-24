// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

// Initialize required constants
const app = express();
const port = 5000;
const dbString = 'mongostring';

// Fix Mongo Client deprication issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Connect to Mongo DB
mongoose.connect( dbString )
.then( () => console.log("MongoDB Connected.") )
.catch( err => console.log("MongoDB Connection Error - " + err) );

// Load Mongoose Models
require('./models/Event');
const Event = mongoose.model('events');

// Express Handlebars Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Express middleware func to set static resources directory
app.use('/static', express.static(__dirname + '/public'));

// Index Route
app.get('/', (req, res) => {
    const title = 'Ascent Events Calendar';
    res.render('index', {
        title, title
    });
});

// About Route
app.get('/how-it-works', (req, res) => {
    res.send('How it Works');
});


app.listen(port, () => {
    console.log(`Server up on port ${port} 🌮`);
});