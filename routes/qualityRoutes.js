const router = require('express').Router();

const middleware = require('../middleware');

const qualityController = require('../controller/qualityController');


router.post('/qualityData', middleware.checkToken, qualityController.list);
router.post('/qualityFilterData', middleware.checkToken, qualityController.filterlist);
router.post('/addQuality', middleware.checkToken, qualityController.save);
router.post('/updateQuality', middleware.checkToken, qualityController.update);
router.get('/checkQualityId/:id', middleware.checkToken, qualityController.checkQualityId);


//to delete quality data from quality table from entry Id
router.get('/qualityData/:id', middleware.checkToken, qualityController.deleteById)
router.post('/getQualityByPartyId', middleware.checkToken, qualityController.getQualityByPartyId)


//to get quality data from quality table from entry Id
router.get('/getQualityDataById/:id', middleware.checkToken, qualityController.getById)
//to get quality data from quality table from entry Id
router.get('/qualitySubTypeList/:type', middleware.checkToken, qualityController.getQualitySubTypeList)
router.get('/qualityTypeList', middleware.checkToken, qualityController.getQualityTypeList)



module.exports = router;