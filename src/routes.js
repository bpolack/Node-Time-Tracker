const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route related constants
const appTitle = 'Node Time Tracker';
const endpoints = {time:'time', projects:'projects', clients:'clients'};

require('./models/Chunk');
require('./models/Client');
require('./models/Project');
const Chunk = mongoose.model('chunks');
const Client = mongoose.model('clients');
const Project = mongoose.model('projects');

// Index Route
router.get('/', (req, res) => {
    res.render('index', {
        title: appTitle,
        endpoint: `/${endpoints.time}`
    });
});

// About Route
router.get('/how-it-works', (req, res) => {
    res.render('how-it-works', {
        title: appTitle,
        endpoint: `/${endpoints.time}`
    });
});

/*
**********
    Client Routes and Processors
**********
*/
// Create Clients Route
router.get(`/${endpoints.clients}`, (req, res) => {
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
            res.render(endpoints.clients + '/index', {
                title: appTitle,
                clients: context.usersClients,
                endpoint: endpoints.clients
            });
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.clients + '/index', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.clients
            });
        });
    
});

// Create Client 'Add' Route
router.get(`/${endpoints.clients}/add`, (req, res) => {
    res.render(endpoints.clients + '/add', {
        title: appTitle,
        endpoint: endpoints.clients
    });
});

// Process Client Add Form
router.post(`/${endpoints.clients}`, (req, res) => {
    let errors = [];

    // Server side form validation
    if (!req.body.name) {
        errors.push({ errMsg: "Client Name must not be empty" });
    }
    if (errors.length > 0) { //Return to form with errors
        res.render(endpoints.clients + '/add', {
            title: appTitle,
            errors: errors,
            postbody: req.body,
            endpoint: endpoints.clients
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
                res.redirect(`/${endpoints.clients}`);
            })
            .catch(err => {
                errors.push({ errMsg: "DB Save Error: " + err });

                res.render(endpoints.clients + '/add', {
                    title: appTitle,
                    errors: errors,
                    postbody: req.body,
                    endpoint: endpoints.clients
                });
            });
    }
});

// Create Client 'Edit' Route
router.get(`/${endpoints.clients}/edit/:id`, (req, res) => {
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
                address: client.address,
                dateMod: client.dateMod,
                dateCreate: client.dateCreate
            }
            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                client: context,
                endpoint: endpoints.clients
            });
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.clients
            });
        });
});

// Process Client Edit Form
router.put(`/${endpoints.clients}/:id`, (req, res) => {
    let errors = [];

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
                    res.redirect(`/${endpoints.clients}`);
                })
                .catch(err => {
                    errors.push({ errMsg: "DB Save Error: " + err });
                    res.render(endpoints.clients + '/edit', {
                        title: appTitle,
                        errors: errors,
                        endpoint: endpoints.clients
                    });
                });
        })
        .catch(err => {
            errors.push({ errMsg: "ID Not Found Error: " + err });
            res.render(endpoints.clients + '/edit', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.clients
            });
        });
});

// Process Client Delete Route
router.delete(`/${endpoints.clients}/:id`, (req, res) => {
    Client.deleteOne({ _id:req.params.id })
        .then(() => {
            res.redirect(`/${endpoints.clients}`);
        });
});

/*
**********
    Project Routes and Processors
**********
*/
// Create Projects Route
router.get(`/${endpoints.projects}`, (req, res) => {
    let errors = [];

    //Fetch all Projects
    Project.find({})
        .sort({title: 'asc'})
        .populate({path: 'client', model: Client})
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
                endpoint: endpoints.projects
            });
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.projects + '/index', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.projects
            });
        });
    
});

// Create Project 'Add' Route
router.get(`/${endpoints.projects}/add`, (req, res) => {

    //Fetch all Clients
    Client.find({})
    .sort({name:'asc'})
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
            endpoint: endpoints.projects
        });
    })
    .catch(err => {
        errors.push({ errMsg: "DB Fetch Error: " + err });
        res.render(endpoints.projects + '/add', {
            title: appTitle,
            errors: errors,
            endpoint: endpoints.projects
        });
    });

});

// Process Project Add Form
router.post(`/${endpoints.projects}`, (req, res) => {
    let errors = [];

    // Server side form validation
    if (!req.body.title) {
        errors.push({ errMsg: "Project Title must not be empty" });
    }
    if (errors.length > 0) { //Return to form with errors
        res.render(endpoints.projects + '/add', {
            title: appTitle,
            errors: errors,
            postbody: req.body,
            endpoint: endpoints.projects
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
            console.log('Truthy client val');
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
                res.redirect(`/${endpoints.projects}`);
            })
            .catch(err => {
                errors.push({ errMsg: "DB Save Error: " + err });

                res.render(endpoints.projects + '/add', {
                    title: appTitle,
                    errors: errors,
                    postbody: req.body,
                    endpoint: endpoints.projects
                });
            });
    }
});

// Create Project 'Edit' Route
router.get(`/${endpoints.projects}/edit/:id`, (req, res) => {
    let errors = [];

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
            .sort({name:'asc'})
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
                    endpoint: endpoints.projects
                });

            })
            .catch(err => {

            })
            
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.projects + '/edit', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.projects
            });
        });
});

// Process Project Edit Form
router.put(`/${endpoints.projects}/:id`, (req, res) => {
    let errors = [];

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
                res.redirect(`/${endpoints.projects}`);
            })
            .catch(err => {
                errors.push({ errMsg: "DB Save Error: " + err });
                res.render(endpoints.projects + '/edit', {
                    title: appTitle,
                    errors: errors,
                    endpoint: endpoints.projects
                });
            });
    })
    .catch(err => {
        errors.push({ errMsg: "ID Not Found Error: " + err });
        res.render(endpoints.projects + '/edit', {
            title: appTitle,
            errors: errors,
            endpoint: endpoints.projects
        });
    });
    
});

// Process Project Delete Route
router.delete(`/${endpoints.projects}/:id`, (req, res) => {
    Project.deleteOne({ _id:req.params.id })
        .then(() => {
            res.redirect(`/${endpoints.projects}`);
        });
});

/*
**********
    Time Chunk Routes and Processors
**********
*/
// Create Main Time Route (Chunk data is not loaded directly from here, but from within the calendar)
router.get(`/${endpoints.time}`, (req, res) => {
    let errors = [];

    //Fetch all Projects for Select2 dropdowns
    Project.find({})
        .sort({title:'asc'})
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
                endpoint: endpoints.time
            });

        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.time + '/index', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.time
            });
        });
    
});

// Create Time Chunk 'Add' Route
router.get(`/${endpoints.time}/add`, (req, res) => {

    //Fetch all Projects
    Project.find({})
    .sort({title:'asc'})
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
            endpoint: endpoints.time
        });
    })
    .catch(err => {
        errors.push({ errMsg: "DB Fetch Error: " + err });
        res.render(endpoints.time + '/add', {
            title: appTitle,
            errors: errors,
            endpoint: endpoints.time
        });
    });

});

// Process Time Chunk Add Form
router.post(`/${endpoints.time}`, (req, res) => {
    let errors = [];

    // Server side form validation
    if (!req.body.title) {
        errors.push({ errMsg: "Time Chunk Title must not be empty" });
    }
    if (errors.length > 0) { //Return to form with errors
        res.render(endpoints.time + '/add', {
            title: appTitle,
            errors: errors,
            postbody: req.body,
            endpoint: endpoints.time
        });
    }
    else {
        // Valid, insert into db
        const newChunk = {
            title: req.body.title,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            content: req.body.content,
            refLink: req.body.refLink,
            project: req.body.project
        }
        new Chunk(newChunk)
            .save()
            .then(chunk => {
                res.redirect(`/${endpoints.time}`);
            })
            .catch(err => {
                errors.push({ errMsg: "DB Save Error: " + err });

                res.render(endpoints.time + '/add', {
                    title: appTitle,
                    errors: errors,
                    postbody: req.body,
                    endpoint: endpoints.time
                });
            });
    }
});

// Create Time Chunk 'Edit' Route
router.get(`/${endpoints.time}/edit/:id`, (req, res) => {
    let errors = [];

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
            .sort({title:'asc'})
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
                    endpoint: endpoints.time
                });

            })
            .catch(err => {

            })
            
        })
        .catch(err => {
            errors.push({ errMsg: "DB Fetch Error: " + err });
            res.render(endpoints.time + '/edit', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.time
            });
        });
});

// Process Time Chunk Edit Form
router.put(`/${endpoints.time}/:id`, (req, res) => {
    let errors = [];

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
                    errors.push({ errMsg: "DB Save Error: " + err });
                    res.render(endpoints.time + '/edit', {
                        title: appTitle,
                        errors: errors,
                        endpoint: endpoints.time
                    });
                }
                
            });
    })
    .catch(err => {
        errors.push({ errMsg: "Single Time ID Not Found Error: " + err });
        res.render(endpoints.time + '/edit', {
            title: appTitle,
            errors: errors,
            endpoint: endpoints.time
        });
    });
    
});

// Create Time Chunk Data Connector Route to handle all calendar views
router.post(`/${endpoints.time}/data`, (req, res) => {
    let errors = [];

    //Fetch all Time Chunks
    Chunk.find({
            $or:[
                {$and:[
                    {startDate:{
                        $lte: req.body.end
                    }},
                    {startDate:{
                        $gte: req.body.start
                    }}
                ]},
                {$and:[
                    {endDate:{
                        $lte: req.body.end
                    }},
                    {endDate:{
                        $gte: req.body.start
                    }}
                ]},
            ]
        })
        .sort({title: 'asc'})
        .populate({path: 'project', model: Project})
        .then(chunks => {
            // Create context Object to pass only required data to user
            const context = {
                usersChunks: chunks.map(chunk => {
                    if (chunk.project) {
                        return {
                            id: chunk.id,
                            title: chunk.title,
                            start: chunk.startDate,
                            end: chunk.endDate,
                            content: chunk.content,
                            project: chunk.project.title
                        }
                    }
                    else {
                        return {
                            id: chunk.id,
                            title: chunk.title,
                            start: chunk.startDate,
                            end: chunk.endDate,
                            content: chunk.content,
                            project: ''
                        }
                    }
                })
            }
            res.json(context.usersChunks);
        })
        .catch(err => {
            errors.push({ errMsg: "Data Fetch Error: " + err });
            res.render(endpoints.time + '/index', {
                title: appTitle,
                errors: errors,
                endpoint: endpoints.time
            });
        });
    
});


module.exports = router;