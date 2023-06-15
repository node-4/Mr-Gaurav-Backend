const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Vender = require("../models/vendorModel");
const transaction = require("../models/transactionModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Razorpay = require("razorpay");
const OrderReturn = require('../models/order_return')
const refundRequest = require('../models/refundRequest');
const orderModel = require("../models/orderModel");
const wallet = require("../models/wallet");
const Invoice = require('../models/invoice_model');

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_8VsYUQmn8hHm69",
  key_secret: "Xcg3HItXaBuQ9OIpeOAFUgLI",
});
// Create new Order
// exports.newOrder = catchAsyncErrors(async (req, res, next) => {
//   const {
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//   } = req.body;

//   // const productIds = orderItems.map((order) => order.product);
//   // let venders = []

//   // for (let i = 0; productIds.length > 0; i++) {
//   //   const product = await Product.findById(productIds[i]);
//   //   const vender = await Vender.aggregate([
//   //     { $match: { _id: product.user } },
//   //     { $project: { _id: 1 } },
//   //   ]);

//   // }

//   const order = await Order.create({
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paidAt: Date.now(),
//     user: req.user._id,
//   });

//   res.status(201).json({
//     success: true,
//     order,
//   });
// });

// // get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});
// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user });

  res.status(200).json({
    success: true,
    orders,
  });
});
// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate("orderItems.product");

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});
//get all Orders - Vender
exports.getAllOrdersVender = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.aggregate([
    {
      $project: {
        orderItems: {
          $filter: {
            input: "$orderItems",
            as: "newOrderItems",
            cond: { "$$newOrderItems.venderId": req.user._id },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    orders,
  });
});
// // update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}
// // delete Order -- Admin
// exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     return next(new ErrorHander("Order not found with this Id", 404));
//   }

//   await order.remove();

//   res.status(200).json({
//     success: true,
//   });
// });
exports.checkout = async (req, res, next) => {
  try {
    await Order.findOneAndDelete({
      user: req.body.userId,
      orderStatus: "unconfirmed",
    });

    const { address } = req.body;

    const cart = await Cart.findOne({ user: req.body.userId })
      .populate({
        path: "products.product",
        select: { review: 0 },
      })
      .populate({
        path: "coupon",
        select: "couponCode discount expirationDate",
      });

    const order = new Order({ user: req.body.userId, address });

    let grandTotal = 0;

    const orderProducts = cart.products.map((cartProduct) => {
      const total = cartProduct.quantity * cartProduct.product.price;
      grandTotal += total;
      return {
        product: cartProduct.product._id,
        unitPrice: cartProduct.product.price,
        quantity: cartProduct.quantity,
        total,
      };
    });

    order.products = orderProducts;

    if (cart.coupon) {
      order.coupon = cart.coupon._id;
      order.discount = 0.01 * cart.coupon.discount * grandTotal;
    }

    order.grandTotal = grandTotal;
    order.shippingPrice = 10;
    order.amountToBePaid = grandTotal + order.shippingPrice - order.discount;

    await order.save();

    await order.populate([
      { path: "products.product", select: { reviews: 0 } },
      {
        path: "coupon",
        select: "couponCode discount expirationDate",
      },
    ]);

    return res.status(200).json({
      success: true,
      msg: "order created",
      order,
    });
  } catch (error) {
    next(error);
  }
};
exports.placeOrder = async (req, res, next) => {
  try {
    console.log(req.body.userId)
    const order = await Order.findOne({
      user: req.body.userId,
      orderStatus: "unconfirmed",
    });
    console.log(order)

    const amount = order.amountToBePaid;

    const orderOptions = {
      amount: amount * 100,
      currency: "INR",
    };
    console.log(orderOptions);

    const paymentGatewayOrder = await razorpayInstance.orders.create(
      orderOptions
    );

    order.paymentGatewayOrderId = paymentGatewayOrder.id;
    order.orderStatus = "confirmed";
    await order.save();

    return res.status(200).json({
      msg: "order id",
      orderId: paymentGatewayOrder.id,
      amount: amount * 100,
    });
  } catch (error) {
    console.log(error)
    //next(error);
  }
};
exports.placeOrderCOD = async (req, res, next) => {
  try {
    console.log(req.body.userId)
    const order = await Order.findOne({
      user: req.body.userId,
      orderStatus: "unconfirmed",
    });
    console.log(order)

    const amount = order.amountToBePaid;

    const orderOptions = {
      amount: amount * 100,
      currency: "INR",
    };
    console.log(orderOptions);

    // const paymentGatewayOrder = await razorpayInstance.orders.create(
    //   orderOptions
    // );

    order.paymentGatewayOrderId = "Cash"
    order.orderStatus = "confirmed";
    await order.save();

    return res.status(200).json({
      msg: "order id",
      //  orderId: paymentGatewayOrder.id,
      amount: amount * 100,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      orderStatus: "confirmed",
    }).populate({
      path: "products.product",
      select: {
        reviews: 0
      }
    }).populate({
      path: "coupon",
      select: "couponCode discount expirationDate"
    });

    return res.status(200).json({
      success: true,
      msg: "orders of user",
      orders
    })
  } catch (error) {
    res.status(400).json({
      message: err.message
    })
  }
};
exports.orderReturn = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = await Order.findOne({ _id: orderId });
    if (!data) {
      return res.status(500).json({
        message: "OrderId is Not present "
      })
    } else {
      const Data = {
        user: data.user,
        orderId: orderId
      }
      const returnData = await OrderReturn.create(Data);
      if (returnData) {
        res.status(200).json({ details: returnData })
      }
    }
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}
exports.GetAllReturnOrderbyUserId = async (req, res) => {
  try {
    const data = await OrderReturn.find({ user: req.params.userId });
    if (data.length == 0) {
      return res.status(500).json({
        message: "No Return list found  this user "
      })
    } else {
      res.status(200).json({
        message: data
      })
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}
exports.AllReturnOrder = async (req, res) => {
  try {
    const data = await OrderReturn.find();
    res.status(200).json({
      message: data
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}
exports.GetReturnByOrderId = async (req, res) => {
  try {
    const data = await OrderReturn.findOne({ orderId: req.params.id });
    if (!data) {
      return res.status(500).json({
        message: "No Data Found "
      })
    }
    res.status(200).json({
      message: data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate({ path: 'user', options: { strictPopulate: true } })

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});
exports.createTransaction = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id });
    let obj = {
      user: req.user._id,
      orderId: order._id,
      date: Date.now(),
      amount: req.body.amount,
      paymentMode: req.body.paymentMode,
      Status: req.body.status,
    };
    const data = await transaction.create(obj);
    if (data) {
      order.paymentGatewayOrderId = req.body.payId;
      if (req.body.status == "Success") {
        order.orderStatus = "confirmed";
        order.paymentStatus = "paid";
        await order.save();
        const cart = await Cart.findOne({ user: req.user._id });
        const deleteCart = await Cart.findByIdAndDelete({ _id: cart._id, });
        return res.status(200).json({ msg: "order id", data: data });
      } else {
        return res.status(200).json({ msg: "order id", data: data });
      }
    }
  } catch (error) {
    next(error);
  }
};
exports.createTransactionbyAdmin = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id });
    console.log(order, order.user);
    let obj = {
      user: order.user,
      orderId: order._id,
      date: Date.now(),
      amount: req.body.amount,
      paymentMode: req.body.paymentMode,
      Status: req.body.status,
    };
    const data = await transaction.create(obj);
    if (data) {
      order.orderStatus = "confirmed";
      await order.save();
      return res.status(200).json({ msg: "order id", data: data });
    }
  } catch (error) {
    next(error);
  }
};
exports.allTransaction = async (req, res) => {
  try {
    const data = await transaction.find().populate("user orderId");
    res.status(200).json({ totalOrders: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.allTransactionUser = async (req, res) => {
  try {
    const data = await transaction.find({ user: req.user._id }).populate("user orderId");
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.allcreditTransactionUser = async (req, res) => {
  try {
    const data = await transaction.find({ user: req.user._id, type: "Credit" });
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.allDebitTransactionUser = async (req, res) => {
  try {
    const data = await transaction.find({ user: req.user._id, type: "Debit" });
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.orderAmountRefund = async (req, res) => {
  try {
    const data = await OrderReturn.findOne({ _id: req.params.orderReturnId });
    if (!data) {
      return res.status(500).json({ message: "Return Order is Not present " })
    } else {
      const Data = {
        user: data.user,
        orderId: data.orderId,
        orderReturnId: data._id,
      }
      const returnData = await refundRequest.create(Data);
      if (returnData) {
        res.status(200).json({ details: returnData })
      }
    }
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}
exports.allRefundrequest = async (req, res) => {
  try {
    const data = await refundRequest.find({ user: req.user._id });
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.allRefundrequestbyAdmin = async (req, res) => {
  try {
    const data = await refundRequest.find();
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.viewRefundrequest = async (req, res) => {
  try {
    const data = await refundRequest.findById({ _id: req.params.id });
    res.status(200).json({ data: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.acceptRefundrequest = async (req, res) => {
  try {
    const data = await refundRequest.findById({ _id: req.params.id });
    if (date) {
      let findOrder = await orderModel.findById({ _id: data.orderId });
      if (findOrder) {
        let findWallet = await wallet.findOne({ user: data.user });
        if (findWallet) {
          let update = await wallet.findByIdAndUpdate({ _id: findWallet._id }, { $set: { balance: findWallet.balance + parseInt(findOrder.grandTotal) } }, { new: true });
          if (update) {
            let updates = await refundRequest.findByIdAndUpdate({ _id: data._id }, { $set: { status: "Accept" } }, { new: true });
            res.status(200).json({ message: "Refund request.", status: 200, data: updates });
          }
        }
      }
    } else {
      res.status(404).json({ message: "Data not found", status: 404, data: {} });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.rejectRefundrequest = async (req, res) => {
  try {
    const data = await refundRequest.findById({ _id: req.params.id });
    if (date) {
      let updates = await refundRequest.findByIdAndUpdate({ _id: data._id }, { $set: { status: "Reject" } }, { new: true });
      res.status(200).json({ message: "Refund request.", status: 200, data: updates });
    } else {
      res.status(404).json({ message: "Data not found", status: 404, data: {} });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.getInvoiceByOrderId = async (req, res) => {
  try {
    const result = await Invoice.findById({ OrderId: req.params.OrderId });
    res.status(200).json({ message: "ok", result: result })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "not ok",
      error: err.message
    })
  }
}
