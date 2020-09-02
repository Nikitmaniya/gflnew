const router = require('express').Router();

const middleware = require('../../middleware');

const supplierRateController = require('../../controller/supplier/supplierRateController');

router.get('/getSupplierRateList/:id', middleware.checkToken, supplierRateController.supplierRateListBySupplierId);
router.post('/updateSupplierRateList', middleware.checkToken, supplierRateController.save);

module.exports = router;