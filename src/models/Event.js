const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let hourFromNow = function(){
    return moment().add(1, 'hour');
};

//Create Schema
const EventSchema = new Schema({
    title: {
        type: String,
        required: true
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
    isAllDay: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    content: {
        type: String
    },
    learnMoreLink: {
        type: String
    },
});

mongoose.model('events', EventSchema);