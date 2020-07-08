const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    },
    dateCreate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

mongoose.model('clients', ClientSchema);