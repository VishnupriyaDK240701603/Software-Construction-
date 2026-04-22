/**
 * Price Alerts Controller
 * Manages price drop notifications for authenticated users.
 */
const db = require('../config/db');
const { validateAlert } = require('../utils/validators');

/**
 * GET /api/alerts
 * Get all alerts for the current user
 */
async function getAlerts(req, res, next) {
  try {
    const alerts = await db.alerts.find({ userId: req.user._id });

    // Populate with product and current price data
    const items = [];
    for (const alert of alerts) {
      const product = await db.products.findOne({ _id: alert.productId });
      const prices = await db.prices.find({ productId: alert.productId });
      const cheapest = prices.sort((a, b) => a.price - b.price)[0];

      items.push({
        _id: alert._id,
        product: product || { name: 'Unknown Product' },
        targetPrice: alert.targetPrice,
        currentCheapest: cheapest?.price || null,
        isTriggered: cheapest ? cheapest.price <= alert.targetPrice : false,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
      });
    }

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/alerts
 * Create a new price alert
 */
async function createAlert(req, res, next) {
  try {
    const { productId, targetPrice } = req.body;

    // Validate
    const errors = validateAlert({ productId, targetPrice: parseFloat(targetPrice) });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Verify product exists
    const product = await db.products.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Limit alerts per user (max 20)
    const userAlertCount = await db.alerts.count({ userId: req.user._id });
    if (userAlertCount >= 20) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum alert limit reached (20). Please remove some alerts first.' 
      });
    }

    const alert = await db.alerts.insert({
      userId: req.user._id,
      productId,
      targetPrice: parseFloat(targetPrice),
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/alerts/:id
 * Update an alert (toggle active state or update target price)
 */
async function updateAlert(req, res, next) {
  try {
    const alert = await db.alerts.findOne({ _id: req.params.id, userId: req.user._id });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const updates = {};
    if (req.body.targetPrice !== undefined) {
      updates.targetPrice = parseFloat(req.body.targetPrice);
    }
    if (req.body.isActive !== undefined) {
      updates.isActive = Boolean(req.body.isActive);
    }

    await db.alerts.update({ _id: req.params.id }, { $set: updates });
    const updated = await db.alerts.findOne({ _id: req.params.id });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/alerts/:id
 * Delete a price alert
 */
async function deleteAlert(req, res, next) {
  try {
    const removed = await db.alerts.remove(
      { _id: req.params.id, userId: req.user._id },
      {}
    );

    if (removed === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert };
