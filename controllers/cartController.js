const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const ErrorHander = require("../utils/errorhander");
const moment = require("moment");
const cartModel = require("../models/cartModel");

exports.addToCart = async (req, res, next) => {
  try {
    const  product  = req.params.id;
    let cart = await Cart.findOne({
      user: req.body.userId
    });

    if (!cart) {
      cart = await createCart (req.body.userId);
    }

    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });

    if (productIndex < 0) {
      cart.products.push({ product });
    } else {
      cart.products[productIndex].quantity++;
    }

    await cart.save();

    return res.status(200).json({
      msg: "product added to cart",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const product = req.params.id;
    const { quantity } = req.body;
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await createCart(req.user._id);
    }

    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });
   console.log(productIndex)

    if (productIndex < 0 && quantity > 0) {
      cart.products.push({ product, quantity });
    } else if (productIndex >= 0 && quantity > 0) {
      cart.products[productIndex].quantity = quantity;
    } else if (productIndex >= 0) {
      cart.products.splice(productIndex, 1);
    }

    await cart.save();

   //const cartResponse = await getCartResponse(cart);

    return res.status(200).json({
      success: true,
      msg: "cart updated",
     // cart: cartResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({user: req.params.id});
      if(!cart){
        return res.status(201).json({
          message: "No Data Found "
        })
      }
        const cartResponse = await getCartResponse(cart);

        return res.status(200).json({
            success: true,
            msg: "cart",
            cart: cartResponse
        })
    } catch (error) {
        next(error);
    }
}

exports.applyCoupon = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({user: req.user._id});

        const coupon = await Coupon.findOne({
            couponCode: req.body.couponCode,
            expirationDate: {$gte: new Date(moment().format("YYYY-MM-DD"))},
            activationDate: {$lte: new Date(moment().format("YYYY-MM-DD"))}
        })
        console.log("coupon",coupon)
        console.log("cartCoupon",cart)

        if(!coupon){
            next(new ErrorHander("invalid coupon code", 400))
        }
   
        cart.coupon = coupon._id;

        await cart.save();

        return res.status(200).json({
            success: true,
            msg: "coupon applied successfully"
        })
     
    } catch (error) {
        console.log(error);
        next(error);
       
    }
}

const createCart = async (userId) => {
  try {
    const cart = await Cart.create({ user: userId });

    return cart;
  } catch (error) {
    throw error;
  }
};

const getCartResponse = async ( cart, req,res) => {
  try {
    await cart.populate([
      { path: "products.product", select: { reviews: 0 } },
      { path: "coupon", select: "couponCode discount expirationDate" },
    ]);

    if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
      cart.coupon = undefined;
      cart.save();
    }
    const cartResponse = cart.toObject();
   console.log(cartResponse);

    let discount = 0;
    let total = 0;
    cartResponse.products.forEach((cartProduct) => {
      console.log(cartProduct)
      if(cartProduct.product == null || cartProduct.product ==0 ){
      //   cart.product= cart.product.filter(function(item) {
      //     return item !== 
      // })
        cart.products = [];
        cart.quantity =0 
        cart.subTotal = 0
        let data = cart.save();
        return res.status(500).json({
          message: "Product is not Avaible in cart "
        })
      }else{
      cartProduct.total = cartProduct.product.price * cartProduct.quantity;
      total += cartProduct.total;
      }
    });

    if (cartResponse.coupon) {
      discount = 0.01 * cart.coupon.discount * total;
    }

    cartResponse.subTotal = total;
    cartResponse.discount = discount;
    cartResponse.total = total - discount;
    cartResponse.shipping = 10;

    return cartResponse;
  } catch (error) {
    throw error;
  }
};


const orderByCOD = async(req,res) => {
  try{
  
  }catch(err){
    console.log(err)
    throw err
  }
}