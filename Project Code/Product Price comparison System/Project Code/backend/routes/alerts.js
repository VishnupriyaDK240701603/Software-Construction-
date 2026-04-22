/**
 * Alert Routes (protected)
 */
const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, updateAlert, deleteAlert } = require('../controllers/alerts');
const { protect } = require('../middleware/auth');

router.use(protect); // All alert routes require authentication

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
