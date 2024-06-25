const express = require('express');
const maincontroller = require('../controllers/maincontroller');
const mainrouter = express.Router();

mainrouter.get('/', maincontroller.index);

mainrouter.get('/index', maincontroller.index);

mainrouter.get('/about',maincontroller.about);

mainrouter.get('/contact',maincontroller.contact);

module.exports = mainrouter;