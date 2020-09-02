const router = require('express').Router();
const middleware = require('../middleware');
const processController = require('../controller/processController');

router.post('/processList', middleware.checkToken, processController.list)
router.get('/deleteProcess/:id', middleware.checkToken, processController.deleteById)
router.get('/getProcessById/:id', middleware.checkToken, processController.getById)
router.post('/updateProcess', middleware.checkToken, processController.update)
router.post('/addProcess', middleware.checkToken, processController.save)


module.exports = router;