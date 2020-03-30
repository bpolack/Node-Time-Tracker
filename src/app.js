// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize required constants
const app = express();
const port = 5000;
const appTitle = 'Node Time Tracker';
const addItems = ['/time/add/', '/projects/add/', '/clients/add/'];
const dbString = 'placeholder';

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
require('./models/Chunk');
require('./models/Client');
require('./models/Project');
const Chunk = mongoose.model('chunks');
const Client = mongoose.model('clients');
const Project = mongoose.model('projects');

// Express Handlebars Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Express middleware func to set static resources directory
app.use('/static', express.static(__dirname + '/public'));

// Body Parser Middleware (form post parsing)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Index Route
app.get('/', (req, res) => {
    res.render('index', {
        title: appTitle,
        addItem: addItems[0]
    });
});

// About Route
app.get('/how-it-works', (req, res) => {
    res.render('how-it-works', {
        title: appTitle,
        addItem: addItems[0]
    });
});

// Create Clients Route
app.get('/clients', (req, res) => {
    let errors = [];

    //Fetch all Clients
    Client.find({})
        .sort({name:'asc'})
        .then(clients => {
            // Create context Object to pass only required data to user
            const context = {
                usersClients: clients.map(client => {
                    return {
                        id: client.id,
                        name: client.name,
                        contact: client.contact,
                        email: client.email,
                        phone: client.phone,
                        website: client.website
                    }
                })
            }
            res.render('clients/index', {
                title: appTitle,
                clients: context.usersClients,
                addItem: addItems[2]
            });
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render('clients/index', {
                title: appTitle,
                errors: errors,
                addItem: addItems[2]
            });
        });
    
});

// Create Client 'Add' Route
app.get('/clients/add', (req, res) => {
    res.render('clients/add', {
        title: appTitle,
        addItem: addItems[2]
    });
});

// Create Client 'Edit' Route
app.get('/clients/edit/:id', (req, res) => {
    let errors = [];

    //Fetch single Client
    Client.findOne({ _id: req.params.id })
        .then(client => {
            // Create context Object to pass only required data to user
            const context = {
                id: client.id,
                name: client.name,
                contact: client.contact,
                email: client.email,
                phone: client.phone,
                website: client.website,
                address: client.address
            }
            res.render('clients/edit', {
                title: appTitle,
                client: context,
                addItem: addItems[2]
            });
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render('clients/edit', {
                title: appTitle,
                errors: errors,
                addItem: addItems[2]
            });
        });
});

// Process Client Add Form
app.post('/clients', (req, res) => {
    let errors = [];

    // Server side form validation
    if (!req.body.name) {
        errors.push({ errMsg: "Client Name must not be empty" });
    }
    if (errors.length > 0) { //Return to form
        res.render('clients/add', {
            title: appTitle,
            errors: errors,
            postbody: req.body,
            addItem: addItems[2]
        });
    }
    else {
        // Valid, insert into db
        const newClient = {
            name: req.body.name,
            contact: req.body.contact,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            website: req.body.website
        }
        new Client(newClient)
            .save()
            .then(idea => {
                res.redirect('/clients');
            })
            .catch(err => {
                errors.push({ errMsg: "DB Save Error: " + err });

                res.render('clients/add', {
                    title: appTitle,
                    errors: errors,
                    postbody: req.body,
                    addItem: addItems[2]
                });
            });
    }
});


app.listen(port, () => {
    console.log(`Time Tracker server up on port ${port} 🌮`);
});