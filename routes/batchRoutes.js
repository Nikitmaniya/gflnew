const router = require('express').Router();
const middleware = require('../middleware');
const batchController = require('../controller/batchController');

router.post('/batchList', middleware.checkToken, batchController.list)
router.post('/batchListByQualityId', middleware.checkToken, batchController.batchListByQualityId)
router.post('/addBatch', middleware.checkToken, batchController.save)
router.post('/updateBatch', middleware.checkToken, batchController.update)
router.get('/deleteBatch/:id', middleware.checkToken, batchController.deleteById)
router.get('/getBatchById/:id', middleware.checkToken, batchController.getBatchDetailById)
router.get('/getGrListByQualityId/:id', middleware.checkToken, batchController.getGrListByQualityId)

module.exports = router;