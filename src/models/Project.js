const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let hourFromNow = function(){
    return moment().add(1, 'hour');
};

//Create Schema
const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    isStar: {
        type: Boolean,
        default: false
    },
});

mongoose.model('projects', ProjectSchema);