const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
    return [
        // username must be an email
        body('username').isEmail().withMessage('Must enter a valid email address'),
        // password must be at least 10 chars long
        body('password')
        .isLength({ min: 10 })
            .withMessage('Invalid password, must be at least 10 chars long')
        .matches(/\d/)
            .withMessage('Invalid password, must contain at least one number'),
        // check the password confirmation field
        body('confirmPassword', 'Passwords do not match')
            .custom((value, {req}) => (value === req.body.password)),
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    let extractedErrors = [];
    errors.array().map(err => extractedErrors.push("Validation Error: "+ err.msg ));

    return res.render('sign-up', {
        error: extractedErrors
    });
}

module.exports = {
    userValidationRules,
    validate,
}