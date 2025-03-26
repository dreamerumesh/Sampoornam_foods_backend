// server/controllers/history.controller.js
const History = require('../models/History');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { generateWhatsAppLink } = require('../utils/whatsappService');

// @desc    Place order and create history entry
// @route   POST /api/history/place-order
// @access  Private
exports.placeOrder = async (req, res, next) => {
  try {
    const { address } = req.body;
    const userId = req.user.id;

    // Get user cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your cart is empty' 
      });
    }

        

    // Get user details for phone number
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    

    // Create history items from cart items
    const historyItems = cart.items
      .filter(item => !item.isSavedForLater)
      .map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price
      }));

    if (historyItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items to order' 
      });
    }

    // Calculate total (should match cart total)
    const total = historyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create history record
    const history = new History({
      user: userId,
      items: historyItems,
      total,
      address,
      phone: user.phone,
      status: 'ordered'
    });

    await history.save();

    // Create WhatsApp message
    const itemsList = historyItems.map(item => 
      `${item.name} x${item.quantity}`
    ).join('\n');

    const whatsAppMessage = 
`New Order:

Items:
${itemsList}

Total: Rs.${total.toFixed(2)}
Shipping Address: ${address}
Contact: ${user.phone}

Thank you for your order!`;

    // Generate WhatsApp link
    const whatsAppLink = generateWhatsAppLink(user.phone, whatsAppMessage);

    // Clear cart after successful order
    cart.items = cart.items.filter(item => item.isSavedForLater);
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      whatsAppLink: whatsAppLink,
      data: history
    });
  } catch (error) {
    console.error('Error placing order:', error);
    next(error);
  }
};

// @desc    Check if order can be cancelled
// @route   GET /api/history/:id/can-cancel
// @access  Private
exports.canCancel = async (req, res, next) => {
  try {
    const historyId = req.params.id;
    const userId = req.user.id;

    // Find the order
    const order = await History.findOne({ 
      _id: historyId, 
      user: userId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(200).json({
        success: true,
        canCancel: false,
        message: 'Order is already cancelled'
      });
    }
    
    // Check if order is delivered
    if (order.status === 'delivered') {
      return res.status(200).json({
        success: true,
        canCancel: false,
        message: 'Delivered orders cannot be cancelled'
      });
    }

    // Check if order is within 30 minutes
    const orderTime = new Date(order.orderDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - orderTime) / (1000 * 60); // time difference in minutes
    //const remainingMinutes = Math.max(0, 30 - Math.floor(timeDiff));

    if (timeDiff <= 30) {
      return res.status(200).json({
        success: true,
        canCancel: true,
    //     remainingMinutes: remainingMinutes,
    //     message: `You can cancel this order for the next ${remainingMinutes} minutes`
     });
    } else {
      return res.status(200).json({
        success: true,
        canCancel: false,
        message: 'Order cancellation window has expired'
      });
    }
  } catch (error) {
    console.error('Error checking cancellation eligibility:', error);
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/history/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const historyId = req.params.id;
    const userId = req.user.id;

    // Find the order
    const order = await History.findOne({ 
      _id: historyId, 
      user: userId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order is already cancelled'
      });
    }

    // Check if order is within 30 minutes
    const orderTime = new Date(order.orderDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - orderTime) / (1000 * 60); // time difference in minutes

    if (timeDiff > 30) {
      return res.status(400).json({
        success: false,
        message: 'Orders can only be cancelled within 30 minutes of placement'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Create item list for WhatsApp message
    const itemsList = order.items.map(item => 
      `${item.name} x${item.quantity}`
    ).join('\n');

    // Send WhatsApp notification
    const whatsAppMessage = 
`Order Cance Request:

Order ID: ${order._id}
Cancellation Time: ${new Date().toLocaleString()}

Cancelled Items:
${itemsList}

Total: Rs.${order.total.toFixed(2)}

Your order has been cancelled successfully.`;

    // Get user phone
    const user = await User.findById(userId);
    
    // Generate WhatsApp link
    const whatsAppLink = generateWhatsAppLink(user.phone, whatsAppMessage);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      whatsAppLink: whatsAppLink,
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    next(error);
  }
};

// @desc    Get user order history (most recent first)
// @route   GET /api/history
// @access  Private
exports.getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await History.find({ user: userId })
      .sort({ orderDate: -1 }); // Sort by orderDate descending (newest first)

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/history/:id
// @access  Private
// exports.getOrderDetails = async (req, res, next) => {
//   try {
//     const historyId = req.params.id;
//     const userId = req.user.id;

//     const order = await History.findOne({ 
//       _id: historyId, 
//       user: userId 
//     });

//     if (!order) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Order not found' 
//       });
//     }

//     // Check cancellation eligibility
//     const orderTime = new Date(order.orderDate).getTime();
//     const currentTime = new Date().getTime();
//     const timeDiff = (currentTime - orderTime) / (1000 * 60);
//     const canCancel = order.status === 'ordered' && timeDiff <= 30;
//     const remainingMinutes = Math.max(0, 30 - Math.floor(timeDiff));

//     res.status(200).json({
//       success: true,
//       data: order,
//       canCancel,
//       remainingMinutes: canCancel ? remainingMinutes : 0
//     });
//   } catch (error) {
//     console.error('Error fetching order details:', error);
//     next(error);
//   }
// };