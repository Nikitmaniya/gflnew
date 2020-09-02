const router = require('express').Router();
const colourStockController = require('../controller/colourStockController');
const middleware = require('../middleware');

router.post('/colourStockList', middleware.checkToken, colourStockController.list)
router.post('/addColourStock', middleware.checkToken, colourStockController.save)
router.post('/updateColourStock', middleware.checkToken, colourStockController.update)
router.get('/deleteColourStock/:id', middleware.checkToken, colourStockController.deleteById)
router.get('/getColourStockById/:id', middleware.checkToken, colourStockController.getcolourStockDetailById)
router.get('/getIssuedNonIssuedList/:id', middleware.checkToken, colourStockController.getIssuedNonIssuedList)
router.get('/issueColourBox/:id', middleware.checkToken, colourStockController.issueColourBox)

module.exports = router;