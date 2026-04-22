/**
 * Price Routes
 */
const express = require('express');
const router = express.Router();
const { getPrices, getPriceHistory, refreshPrices } = require('../controllers/prices');
const { protect } = require('../middleware/auth');

router.get('/:productId', getPrices);
router.get('/:productId/history', getPriceHistory);
router.post('/:productId/refresh', protect, refreshPrices);

module.exports = router;
