const router = require('express').Router();
const middleware = require('../middleware');
const productionPlanningController = require('../controller/productionPlanningController');

router.post('/productionPlanningList', middleware.checkToken, productionPlanningController.list)
router.post('/addProductionPlanning', middleware.checkToken, productionPlanningController.save)
router.get('/deleteProduction/:id', middleware.checkToken, productionPlanningController.deleteById)
router.get('/getProductionById/:id', middleware.checkToken, productionPlanningController.getById)
router.post('/updateProductionPlanning', middleware.checkToken, productionPlanningController.update)
module.exports = router;