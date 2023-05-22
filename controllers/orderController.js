const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Vender = require("../models/vendorModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Razorpay = require("razorpay");
const OrderReturn = require('../models/order_return')

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


exports.orderReturn =  async(req,res) => {
  try{
  const orderId = req.params.id;
  const data = await Order.findOne({_id: orderId});
  if(!data){
    return res.status(500).json({
      message: "OrderId is Not present "
    })
  }else{
    const Data = {
      user: data.user,
      orderId: orderId
    }
    const returnData = await OrderReturn.create(Data);
    if(returnData){
      await Order.findByIdAndDelete({_id: orderId});
      res.status(200).json({
        details: returnData
      })
    }
  }
  }catch(err){
    res.status(400).json({
      message: err.message
    })
  }
}

exports.GetAllReturnOrderbyUserId = async(req,res) => {
  try{
 const data = await  OrderReturn.find({user: req.params.userId});
 if(data.length == 0 ){
  return res.status(500).json({
    message: "No Return list found  this user "
  })
 }else{
  res.status(200).json({
    message: data
  })
 }
  }catch(err){
    console.log(err);
    res.status(400).json({
      message:err.message
    })
  }
}

exports.AllReturnOrder = async(req,res) => {
  try{
  const data = await OrderReturn.find();
  res.status(200).json({
    message: data
  })
  }catch(err){
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}

exports.GetReturnByOrderId = async(req,res) => {
  try{
  const data = await OrderReturn.findOne({orderId: req.params.id});
  if(!data){
    return res.status(500).json({
      message: "No Data Found "
    })
  }
  res.status(200).json({
    message: data
  })
  }catch(err){
    res.status(400).json({
      message: err.message
    })
  }
}

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate({path: 'user', options: {strictPopulate: true}})

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
