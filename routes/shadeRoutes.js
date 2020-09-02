const router = require('express').Router();
const shadeController = require('../controller/shadeController');
const middleware = require('../middleware');

router.post('/shadeList', middleware.checkToken, shadeController.list)
router.post('/shadeListByQualityId', middleware.checkToken, shadeController.shadeByQualityId)
router.post('/addShade', middleware.checkToken, shadeController.save)
router.post('/updateShade', middleware.checkToken, shadeController.update)
router.get('/deleteShade/:id', middleware.checkToken, shadeController.deleteById)
router.get('/getShadeById/:id', middleware.checkToken, shadeController.getshadeDetailById)
router.get('/checkPartyShadeNo/:id', middleware.checkToken, shadeController.checkPartyShadeNo)
router.post('/shadeFilterList', middleware.checkToken, shadeController.filterList)
module.exports = router;