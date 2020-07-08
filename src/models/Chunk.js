const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let hourFromNow = function(){
    return moment().add(1, 'hour');
};

//Create Schema
const ChunkSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        default: null
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true,
        default: hourFromNow
    },
    isStar: {
        type: Boolean,
        default: false
    },
    content: {
        type: String
    },
    refLink: {
        type: String
    },
});

mongoose.model('chunks', ChunkSchema);