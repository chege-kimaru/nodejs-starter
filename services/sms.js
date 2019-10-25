const logger = require('./logger');

const init = {
    apiKey: process.env.AFRICASTALKING_APIKEY,         // use your sandbox app API key for development in the test environment
    username: process.env.AFRICASTALKING_USERNAME,      // use 'sandbox' for development in the test environment
};
const AfricasTalking = require('africastalking')(init);

// Initialize a service e.g. SMS
sms = AfricasTalking.SMS;

exports.send = (to, message) => {
    // Use the service
    const options = {to, message};

    // Send message and capture the response or error
    sms.send(options)
        .then( response => {
            logger.info(`SMS to ${to} sent successfully`);
        })
        .catch( error => {
            logger.error(error);
        });
};