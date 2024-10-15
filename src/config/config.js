// config/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  mongodbURI: process.env.MONGODB_URI, 
  adminToken: process.env.ADMIN_TOKEN,
};