const router = require('express').Router();
const middleware = require('../middleware');
const userController = require('../controller/userController');
const permissionController = require('../controller/permissionController');

//API to get all users data with permissions 
router.post('/GetAllUsers', middleware.checkToken, userController.list);
router.get('/GetAllUsersNameId', middleware.checkToken, userController.GetAllUsersNameId);

//API to get users data with permissions having user id
router.get('/userData/:userId', middleware.checkToken, userController.getUserDetailById);

// router.get('/getSlaveId', userController.getSlaveId);

//API to add user data with permissions having user id
router.post('/addUser', middleware.checkToken, userController.save);

router.post('/updateUser', middleware.checkToken, userController.updateUser);

router.get('/deleteUser/:id', middleware.checkToken, userController.deleteById);

router.get('/getOTP', middleware.checkToken, permissionController.getOTP);
module.exports = router;