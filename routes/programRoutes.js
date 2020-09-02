const router = require('express').Router();
const middleware = require('../middleware');
const programController = require('../controller/programController');

router.post('/programList', middleware.checkToken, programController.list)
router.post('/programGivenByList', middleware.checkToken, programController.programGivenByList)
router.get('/deleteProgram/:id', middleware.checkToken, programController.deleteById)
router.get('/getProgramById/:id', middleware.checkToken, programController.getById)
router.post('/updateProgram', middleware.checkToken, programController.update)
router.post('/addProgram', middleware.checkToken, programController.save)
router.post('/programListByFilter', middleware.checkToken, programController.filterList)


module.exports = router;