const router = require('express').Router();

const middleware = require('../../middleware');

const supplierController = require('../../controller/supplier/supplierController');


router.post('/supplierList' ,middleware.checkToken, supplierController.list);
router.post('/addSupplier' ,middleware.checkToken, supplierController.save);
router.post('/updateSupplier' ,middleware.checkToken, supplierController.update);
router.get('/deleteSupplierList/:id',middleware.checkToken, supplierController.deleteById)
router.get('/getSupplier/:id',middleware.checkToken, supplierController.getById)
router.get('/supplierItemList',middleware.checkToken,supplierController.supplierItemList);


module.exports = router;