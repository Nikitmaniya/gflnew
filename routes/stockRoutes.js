const router = require('express').Router();
const stockController = require('../controller/stockController');
const middleware = require('../middleware');

router.post('/stockList', middleware.checkToken, stockController.list)
router.post('/stockListByParty', middleware.checkToken, stockController.stockListByParty)
router.post('/addStock', middleware.checkToken, stockController.save)
router.post('/updateStock', middleware.checkToken, stockController.update)
router.get('/deleteStock/:id', middleware.checkToken, stockController.deleteById)
router.get('/getStockById/:id', middleware.checkToken, stockController.getStockDetailById)

module.exports = router;