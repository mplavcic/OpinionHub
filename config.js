const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.PORT,
};

