/**
 * Validates request body
 */

const Validator = require('node-input-validator');

/**
 * Safaricom phone number validator
 */
Validator.extend('safaricom-phone', async (field, value) => {

    let pattern = /^(?:\+254)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/;
    return pattern.test(value);

});


const validateFields = async (req, res, rules, isIo) => {
    const v = new Validator(req.body, rules);
    let matched = await v.check();
    if (!matched) {
        let errors = [];
        for (const key of Object.keys(v.errors)) {
            errors.push(v.errors[key] && v.errors[key].message)
        }
        //to accommodate socket requests
        if (!isIo) res.status(400).json({errors});
        return false;
    }
    return true;
};

module.exports = {validateFields};
