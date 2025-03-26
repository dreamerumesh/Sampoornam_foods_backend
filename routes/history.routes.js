// server/routes/history.routes.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const historyController = require('../controllers/history.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @route   POST /api/history/place-order
 * @desc    Place an order
 * @access  Private
 */
router.post(
  '/place-order',
  [
    auth,
    check('address', 'Shipping address is required').not().isEmpty()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await historyController.placeOrder(req, res, next);
  }
);

/**
 * @route   GET /api/history/:id/can-cancel
 * @desc    Check if order can be cancelled
 * @access  Private
 */
router.get(
  '/:id/can-cancel',
  auth,
  async (req, res, next) => {
    await historyController.canCancel(req, res, next);
  }
);

/**
 * @route   PUT /api/history/:id/cancel
 * @desc    Cancel an order (within 30 minutes)
 * @access  Private
 */
router.put(
  '/:id/cancel',
  auth,
  async (req, res, next) => {
    await historyController.cancelOrder(req, res, next);
  }
);

/**
 * @route   GET /api/history
 * @desc    Get user order history
 * @access  Private
 */
router.get(
  '/',
  auth,
  async (req, res, next) => {
    await historyController.getOrderHistory(req, res, next);
  }
);

/**
 * @route   GET /api/history/:id
 * @desc    Get specific order details
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  async (req, res, next) => {
    await historyController.getOrderDetails(req, res, next);
  }
);

module.exports = router;