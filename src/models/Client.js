const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let hourFromNow = function(){
    return moment().add(1, 'hour');
};

//Create Schema
const ClientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    isStar: {
        type: Boolean,
        default: false
    },
    contact: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    website: {
        type: String,
    },
    dateMod: {
        type: Date,
        required: true,
        default: Date.now
    }
});

mongoose.model('clients', ClientSchema);