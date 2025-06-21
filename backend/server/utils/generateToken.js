const crypto = require('crypto');

function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

module.exports = {generateVerificationToken};