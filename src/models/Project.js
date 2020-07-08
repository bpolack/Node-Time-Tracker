const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client',
        default: null
    },
    isStar: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
    },
    dateMod: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateCreate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

mongoose.model('projects', ProjectSchema);