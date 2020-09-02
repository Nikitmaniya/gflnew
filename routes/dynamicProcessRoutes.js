const router = require('express').Router();
const middleware = require('../middleware');
const dynamicProcessController = require('../controller/dynamicProcessController');

router.post('/dynamicProcessList', middleware.checkToken, dynamicProcessController.list)
router.get('/deletedynamicProcess/:id', middleware.checkToken, dynamicProcessController.deleteById)
router.get('/getdynamicProcessById/:id', middleware.checkToken, dynamicProcessController.getById)
router.post('/updatedynamicProcess', middleware.checkToken, dynamicProcessController.update)
router.post('/adddynamicProcess', middleware.checkToken, dynamicProcessController.save)


module.exports = router;