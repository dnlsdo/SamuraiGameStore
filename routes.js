const express = require('express');
const router = express.Router();
const middleware = require('./src/middlewares/middlewares')
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');

router.get('/', homeController.index);
router.get('/login', middleware.log, loginController.index);
router.post('/login/login', loginController.login);

module.exports = router;