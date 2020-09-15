const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

//Create Schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: { //includes the salt
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    publicEmail: {
        type: String,
    },
    publicPhone: {
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

// Generate a hash for user
/*UserSchema.methods.generateHash = function(password) {
    return bcrypt.hash(password, saltRounds);
};*/

// Check if password is valid
UserSchema.methods.validPassword = function(password) {
    const userHash = this.hash;

    return new Promise((resolve, reject) => {
        bcrypt.compare(password, userHash)
            .then(res => {
                resolve(res); //true or false
            })
            .catch (err => {
                console.error('Bcrypt compare error: ' + err);
                reject(Error("Password decrypt error."));
            });
    });
};

mongoose.model('users', UserSchema);