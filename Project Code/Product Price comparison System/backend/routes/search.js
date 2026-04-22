/**
 * Live Search Routes
 */
const express = require('express');
const router = express.Router();
const { liveSearch } = require('../controllers/search');
const { optionalAuth } = require('../middleware/auth');

router.get('/live', optionalAuth, liveSearch);
router.get('/', optionalAuth, liveSearch); // Also handle /api/search?q=...

module.exports = router;

