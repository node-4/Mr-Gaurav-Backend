const staticContent = require('../controllers/static.Controller');
const express = require('express');
const router = express();
router.post('/createAboutus', staticContent.createAboutUs);
router.put('/aboutUs/:id', staticContent.updateAboutUs);
router.delete('/aboutUs/:id', staticContent.deleteAboutUs);
router.get('/getAboutUs', staticContent.getAboutUs);
router.get('/aboutUs/:id', staticContent.getAboutUsById);
module.exports = router;