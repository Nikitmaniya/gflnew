const router = require('express').Router();
const middleware = require('../middleware');
const partyController = require('../controller/partyController');

router.post('/partyData', middleware.checkToken, partyController.list)
router.get('/deleteParty/:id', middleware.checkToken, partyController.deleteById)
router.get('/getPartyById/:id', middleware.checkToken, partyController.getById)
router.post('/updateParty', middleware.checkToken, partyController.update)
router.post('/addParty', middleware.checkToken, partyController.save)

module.exports = router;