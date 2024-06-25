const express = require('express');
const controller = require('../controllers/usercontroller');
const {isGuest, isLoggedIn,isAuthor} = require('../middlewares/auth');
const router = express.Router();
const {validateId,validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');
const {logInLimiter} = require('../middlewares/rateLimiter');



router.get('/new', isGuest, controller.new);


router.post('/', isGuest,validateSignUp,validateResult, controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login',logInLimiter, isGuest, validateLogIn,validateResult, controller.login);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/logout', isLoggedIn, controller.logout);

router.delete("/trades/:id/unwatch",validateId,isLoggedIn,controller.unwatchTrade);

router.delete('/:id',validateId, isLoggedIn, isAuthor, controller.deletePoster);

module.exports = router;