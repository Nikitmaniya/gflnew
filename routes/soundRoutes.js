const router = require('express').Router();
const soundController = require('../controller/soundController');
const middleware = require('../middleware');

router.get('/soundData',middleware.checkToken, soundController.list);
// router.post('/soundData/:payload', soundController.checkSoundByPayload);
router.post('/saveSendSound', soundController.saveSendSound);
router.post('/saveReceivedSound', soundController.saveReceivedSound);
router.get('/listReceivedSoundData',soundController.listReceivedSoundData);

router.get('/listReceivedSoundData',soundController.listReceivedSoundData);

router.get('/listNodeRed',soundController.list1);
router.post('/saveNodeRed',soundController.saveNodeRed);

module.exports = router;