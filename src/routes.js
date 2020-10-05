const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt');

// Route related constants
const saltRounds = 12;
const appTitle = 'Node Time Tracker';
const endpoints = { time: 'time', projects: 'projects', clients: 'clients' };
const { userValidationRules, validate } = require('./config/validator.js')
const { checkAuth } = require('./config/passport');
//const {check, validationResult} = require('express-validator');

// Load mongoose models
require('./models/User');
require('./models/Chunk');
require('./models/Client');
require('./models/Project');
const User = mongoose.model('users');
const Chunk = mongoose.model('chunks');
const Client = mongoose.model('clients');
const Project = mongoose.model('projects');

// Index Route
router.get('/', (req, res) => {
    res.render('index', {
        title: appTitle,
        endpoint: endpoints.time
    });
});

// Registration Route
router.get('/sign-up', (req, res) => {
    res.render('sign-up', {
        title: appTitle,
        endpoint: endpoints.time,
        error: req.flash('error')
    });
});
// Registration Create User Route
router.post('/sign-up', userValidationRules(), validate, (req, res) => {

    bcrypt.hash(req.body.password, saltRounds) // Migrate this to a passport strategy, move hash to User Schema method
        .then(hash => {
            // Valid, insert into db
            const newUser = {
                email: req.body.email,
                hash: hash,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
            }
            new User(newUser)
                .save()
                .then(user => {
                    req.flash('success', 'New Account Created, Please Log In');
                    res.redirect('/login');
                })
                .catch(err => {
                    req.flash('error', 'DB Save Error: ' + err);

                    res.render('sign-up', {
                        title: appTitle,
                        error: req.flash('error'),
                        postbody: req.body,
                        endpoint: endpoints.time
                    });
                });
        })
        .catch(err => {
            req.flash('error', 'Password Hashing Error - Please contact admin.');
            console.error('Password Hash Err: ' + err);
            res.render('sign-up', {
                title: appTitle,
                error: req.flash('error'),
                endpoint: endpoints.time
            });
        });
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login', {
        title: appTitle,
        endpoint: endpoints.time,
        error: req.flash('error'),
        message: req.flash('message'),
        success: req.flash('success'),
    });
});
router.post('/login', 
    passport.authenticate('local-login', {
        failureRedirect: '/login',
        failureFlash: true
    }), 
    (req, res) => {
        req.flash('success', 'You are now logged in');
        res.redirect('/clients');
    }
);

// Log Out Route
router.get('/logout', function(req, res){
    req.logout();
    req.flash('message', 'You have been signed out');
    res.redirect('/login');
});

// About Route
router.get('/how-it-works', (req, res) => {
    res.render('how-it-works', {
        title: appTitle,
        endpoint: endpoints.time
    });
});

/*
**********
    Client Routes and Processors
**********
*/
// Create Clients Route
router.get(`/${endpoints.clients}`, checkAuth, (req, res) => {
    //Fetch all Clients
    Client.find({})
        .sort({ name: 'asc' })
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
            res.render(endpoints.clients + '/index', {
                title: appTitle,
                clients: context.usersClients,
                endpoint: endpoints.clients,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.clients + '/index', {
                title: appTitle,
                endpoint: endpoints.clients,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Create Client 'Add' Route
router.get(`/${endpoints.clients}/add`, checkAuth, (req, res) => {
    res.render(endpoints.clients + '/add', {
        title: appTitle,
        endpoint: endpoints.clients,
        error: req.flash('error'),
        success: req.flash('success'),
    });
});

// Process Client Add Form
router.post(`/${endpoints.clients}`, checkAuth, (req, res) => {

    // Server side form validation
    if (!req.body.name) {
        req.flash('error', 'Client name must not be empty');
        //Return to form with errors
        res.render(endpoints.clients + '/add', {
            title: appTitle,
            postbody: req.body,
            endpoint: endpoints.clients,
            error: req.flash('error'),
            success: req.flash('success'),
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
            .then(client => {
                req.flash('success', 'New client added');
                res.redirect(`/${endpoints.clients}`);
            })
            .catch(err => {
                req.flash('error', "DB Save Error: " + err);

                res.render(endpoints.clients + '/add', {
                    title: appTitle,
                    postbody: req.body,
                    endpoint: endpoints.clients,
                    error: req.flash('error'),
                    success: req.flash('success'),
                });
            });
    }
});

// Create Client 'Edit' Route
router.get(`/${endpoints.clients}/edit/:id`, checkAuth, (req, res) => {

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
                address: client.address,
                dateMod: client.dateMod,
                dateCreate: client.dateCreate
            }
            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                client: context,
                endpoint: endpoints.clients,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);

            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                endpoint: endpoints.clients,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });
});

// Process Client Edit Form
router.put(`/${endpoints.clients}/:id`, checkAuth, (req, res) => {

    Client.findOne({ _id: req.params.id })
        .then(client => {
            client.name = req.body.name;
            client.contact = req.body.contact;
            client.email = req.body.email;
            client.phone = req.body.phone;
            client.address = req.body.address;
            client.website = req.body.website;
            client.dateMod = Date.now();

            client.save()
                .then(client => {
                    req.flash('success', 'Client information updated');
                    res.redirect(`/${endpoints.clients}`);
                })
                .catch(err => {
                    req.flash('error', "DB Save Error: " + err);
                    res.render(endpoints.clients + '/edit', {
                        title: appTitle,
                        endpoint: endpoints.clients,
                        error: req.flash('error'),
                        success: req.flash('success'),
                    });
                });
        })
        .catch(err => {
            req.flash('error', "ID Not Found Error: " + err);
            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                endpoint: endpoints.clients,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });
});

// Process Client Delete Route
router.delete(`/${endpoints.clients}/:id`, checkAuth, (req, res) => {
    Client.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success', 'Client has been deleted');
            res.redirect(`/${endpoints.clients}`);
        });
});

/*
**********
    Project Routes and Processors
**********
*/
// All Projects Route
router.get(`/${endpoints.projects}`, checkAuth, (req, res) => {

    //Fetch all Projects
    Project.find({})
        .sort({ dateMod: 'desc' })
        .populate({ path: 'client', model: Client })
        .then(projects => {
            // Create context Object to pass only required data to user
            const context = {
                usersProjects: projects.map(project => {
                    if (project.client) {
                        return {
                            id: project.id,
                            title: project.title,
                            client: project.client.name
                        }
                    }
                    else {
                        return {
                            id: project.id,
                            title: project.title,
                            client: ''
                        }
                    }
                })
            }
            res.render(endpoints.projects + '/index', {
                title: appTitle,
                projects: context.usersProjects,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.projects + '/index', {
                title: appTitle,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Create Project 'Add' Route
router.get(`/${endpoints.projects}/add`, checkAuth, (req, res) => {

    //Fetch all Clients
    Client.find({})
        .sort({ name: 'asc' })
        .then(clients => {
            // Create context Object to pass only required data to user
            const context = {
                usersClients: clients.map(client => {
                    return {
                        id: client.id,
                        name: client.name
                    }
                })
            }
            res.render(endpoints.projects + '/add', {
                title: appTitle,
                clients: context.usersClients,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.projects + '/add', {
                title: appTitle,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Process Project Add Form
router.post(`/${endpoints.projects}`, checkAuth, (req, res) => {

    // Server side form validation
    if (!req.body.title) {
        req.flash('error', "Project title must not be empty" );
        //Return to form with errors
        res.render(endpoints.projects + '/add', {
            title: appTitle,
            postbody: req.body,
            endpoint: endpoints.projects,
            error: req.flash('error'),
            success: req.flash('success'),
        });
    }
    else {
        // Valid, insert into db
        let newProject;
        if (req.body.client != "0") {
            newProject = {
                title: req.body.title,
                notes: req.body.notes,
                client: req.body.client
            }
        }
        else {
            newProject = {
                title: req.body.title,
                notes: req.body.notes
            }
        }

        new Project(newProject)
            .save()
            .then(project => {
                req.flash('success', "New project created ");
                res.redirect(`/${endpoints.projects}`);
            })
            .catch(err => {
                req.flash('error', "DB Save Error: " + err);

                res.render(endpoints.projects + '/add', {
                    title: appTitle,
                    postbody: req.body,
                    endpoint: endpoints.projects,
                    error: req.flash('error'),
                    success: req.flash('success'),
                });
            });
    }
});

// Create Project 'Edit' Route
router.get(`/${endpoints.projects}/edit/:id`, checkAuth, (req, res) => {

    //Fetch single Project
    Project.findOne({ _id: req.params.id })
        .then(project => {
            // Create context Object to pass only required data to user
            const projectContext = {
                id: project.id,
                title: project.title,
                client: project.client,
                notes: project.notes,
                dateMod: project.dateMod,
                dateCreate: project.dateCreate
            }
            //Fetch all Clients
            Client.find({})
                .sort({ name: 'asc' })
                .then(clients => {
                    // Create context Object to pass only required data to user
                    const clientsContext = {
                        usersClients: clients.map(client => {
                            return {
                                id: client.id,
                                name: client.name
                            }
                        })
                    }
                    res.render(endpoints.projects + '/edit', {
                        title: appTitle,
                        project: projectContext,
                        clients: clientsContext.usersClients,
                        endpoint: endpoints.projects,
                        error: req.flash('error'),
                        success: req.flash('success'),
                    });

                })
                .catch(err => {
                    
                })

        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.projects + '/edit', {
                title: appTitle,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });
});

// Process Project Edit Form
router.put(`/${endpoints.projects}/:id`, checkAuth, (req, res) => {

    Project.findOne({
        _id: req.params.id
    })
        .then(project => {
            project.title = req.body.title;
            if (req.body.client != "0") {
                project.client = req.body.client;
            }
            project.notes = req.body.notes;
            project.dateMod = Date.now();

            project.save()
                .then(project => {
                    req.flash('success', "Project updated successfully");
                    res.redirect(`/${endpoints.projects}`);
                })
                .catch(err => {
                    req.flash('error', "DB Save Error: " + err);
                    res.render(endpoints.projects + '/edit', {
                        title: appTitle,
                        endpoint: endpoints.projects,
                        error: req.flash('error'),
                        success: req.flash('success'),
                    });
                });
        })
        .catch(err => {
            req.flash('error', "ID Not Found Error: " + err);
            res.render(endpoints.projects + '/edit', {
                title: appTitle,
                endpoint: endpoints.projects,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Process Project Delete Route
router.delete(`/${endpoints.projects}/:id`, checkAuth, (req, res) => {
    Project.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success', "Project deleted");
            res.redirect(`/${endpoints.projects}`);
        });
});

/*
**********
    Time Chunk Routes and Processors
**********
*/
// Create Main Time Route (Chunk data is not loaded directly from here, but from within the calendar)
router.get(`/${endpoints.time}`, checkAuth, (req, res) => {

    //Fetch all Projects for Select2 dropdowns
    Project.find({})
        .sort({ dateMod: 'desc' })
        .populate({ path: 'client', model: Client })
        .then(projects => {
            // Create context Object to pass only required data to user
            const projectsContext = {
                usersProjects: projects.map(project => {
                    return {
                        id: project.id,
                        title: project.title
                    }
                })
            }
            res.render(endpoints.time + '/index', {
                title: appTitle,
                projects: projectsContext.usersProjects,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });

        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.time + '/index', {
                title: appTitle,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Create Time Chunk 'Add' Route
router.get(`/${endpoints.time}/add`, checkAuth, (req, res) => {

    //Fetch all Projects
    Project.find({})
        .sort({ dateMod: 'desc' })
        .then(projects => {
            // Create context Object to pass only required data to user
            const context = {
                usersProjects: projects.map(project => {
                    return {
                        id: project.id,
                        title: project.title
                    }
                })
            }
            res.render(endpoints.time + '/add', {
                title: appTitle,
                projects: context.usersProjects,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err);
            res.render(endpoints.time + '/add', {
                title: appTitle,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Process Time Chunk Add Form
router.post(`/${endpoints.time}`, checkAuth, (req, res) => {

    // Server side form validation
    if (!req.body.title) {
        req.flash('error', "Time Chunk Title must not be empty" );
        //Return to form with errors
        res.render(endpoints.time + '/add', {
            title: appTitle,
            postbody: req.body,
            endpoint: endpoints.time,
            error: req.flash('error'),
            success: req.flash('success'),
        });
    }
    else {
        // Valid, insert into db
        let newChunk;
        if (req.body.project != '0') {
            newChunk = {
                title: req.body.title,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                content: req.body.content,
                refLink: req.body.refLink,
                project: req.body.project
            }
        }
        else {
            newChunk = {
                title: req.body.title,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                content: req.body.content,
                refLink: req.body.refLink
            }
        }
        new Chunk(newChunk)
            .save()
            .then(chunk => {
                if (req.body.noRedirect) {
                    res.send({ message: 'Success' });
                }
                else {
                    req.flash('success', "New Time Added" );
                    res.redirect(`/${endpoints.time}`);
                }
            })
            .catch(err => {
                req.flash('error', "DB Save Error: " + err );

                res.render(endpoints.time + '/add', {
                    title: appTitle,
                    postbody: req.body,
                    endpoint: endpoints.time,
                    error: req.flash('error'),
                    success: req.flash('success'),
                });
            });
    }
});

// Create Time Chunk 'Edit' Route
router.get(`/${endpoints.time}/edit/:id`, checkAuth, (req, res) => {

    //Fetch single Project
    Chunk.findOne({ _id: req.params.id })
        .then(chunk => {
            // Create context Object to pass only required data to user
            const chunkContext = {
                id: chunk.id,
                title: chunk.title,
                startDate: chunk.startDate.toISOString(),
                endDate: chunk.endDate.toISOString(),
                content: chunk.content,
                refLink: chunk.refLink,
                project: chunk.project
            }
            //Fetch all Projects
            Project.find({})
                .sort({ title: 'asc' })
                .then(projects => {
                    // Create context Object to pass only required data to user
                    const projectsContext = {
                        usersProjects: projects.map(project => {
                            return {
                                id: project.id,
                                title: project.title
                            }
                        })
                    }
                    res.render(endpoints.time + '/edit', {
                        title: appTitle,
                        chunk: chunkContext,
                        projects: projectsContext.usersProjects,
                        endpoint: endpoints.time,
                        error: req.flash('error'),
                        success: req.flash('success'),
                    });

                })
                .catch(err => {

                })

        })
        .catch(err => {
            req.flash('error', "DB Fetch Error: " + err );
            res.render(endpoints.time + '/edit', {
                title: appTitle,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });
});

// Process Time Chunk Edit Form
router.put(`/${endpoints.time}/:id`, checkAuth, (req, res) => {

    Chunk.findOne({
        _id: req.params.id
    })
        .then(chunk => {

            chunk.startDate = req.body.startDate;
            chunk.endDate = req.body.endDate;
            if (req.body.process != 'dates') { // if incoming request is not for dates only
                chunk.title = req.body.title;
                chunk.content = req.body.content;
                chunk.refLink = req.body.refLink;
                if (req.body.project != "0") {
                    chunk.project = req.body.project;
                }
            }

            chunk.save()
                .then(chunk => {
                    if (req.body.noRedirect) {
                        res.send({ message: 'Success' });
                    }
                    else {
                        res.redirect(`/${endpoints.time}`);
                    }
                })
                .catch(err => {
                    if (req.body.noRedirect) {
                        res.send({ message: 'DB Save Error: ' + err });
                    }
                    else {
                        req.flash('error', "DB Save Error: " + err );
                        res.render(endpoints.time + '/edit', {
                            title: appTitle,
                            endpoint: endpoints.time,
                            error: req.flash('error'),
                            success: req.flash('success'),
                        });
                    }

                });
        })
        .catch(err => {
            req.flash('error', "Single Time ID Not Found Error: " + err );
            res.render(endpoints.time + '/edit', {
                title: appTitle,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});

// Create Time Chunk Data Connector Route to handle all calendar views
router.post(`/${endpoints.time}/data`, checkAuth, (req, res) => {

    //Fetch all Time Chunks
    Chunk.find({
        $or: [{
                $and: [{
                        startDate: {
                            $lte: req.body.end
                        }
                    },
                    {
                        startDate: {
                            $gte: req.body.start
                        }
                    }
                ]
            },
            {
                $and: [{
                        endDate: {
                            $lte: req.body.end
                        }
                    },
                    {
                        endDate: {
                            $gte: req.body.start
                        }
                    }
                ]
            },
        ]
    })
        .sort({ title: 'asc' })
        .populate({ path: 'project', model: Project })
        .then(chunks => {
            // Create context Object to pass only required data to user
            const context = {
                usersChunks: chunks.map(chunk => {
                    return {
                        id: chunk.id,
                        title: chunk.title,
                        start: chunk.startDate,
                        end: chunk.endDate,
                        content: chunk.content,
                        refLink: chunk.refLink,
                        project: chunk.project
                    }
                })
            }
            res.json(context.usersChunks);
        })
        .catch(err => {
            req.flash('error', "Data Fetch Error: " + err );
            res.render(endpoints.time + '/index', {
                title: appTitle,
                endpoint: endpoints.time,
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });

});


module.exports = router;