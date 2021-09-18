const express = require('express');
const router = express.Router();
const middleware = require('./src/middlewares/middlewares')
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const userController = require('./src/controllers/userController');


router.get('/', homeController.index);
router.get('/login', loginController.index);
router.post('/login/login', loginController.login);
router.get('/user', middleware.loginRequired, userController.index);


router.get('/403', (req, res)=>{
    res.render('403')
});



module.exports = router;