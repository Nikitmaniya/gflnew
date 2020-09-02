const router = require('express').Router();
const middleware = require('../middleware');
const loginController = require('../controller/loginController');

router.post('/SignIn', loginController.login)

module.exports = router;