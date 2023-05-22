const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/checkout",  orderController.checkout);

router.post("/place-order", isAuthenticatedUser, orderController.placeOrder);

router.post('/place-order/cod',isAuthenticatedUser, orderController.placeOrderCOD)

router.get("/orders/me",  isAuthenticatedUser, orderController.getOrders)

// router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get( orderController.getSingleOrder);

//Return Router 
router.route('/order/return/:id').post(orderController.orderReturn);
router.route('/order/return/:userId').get(orderController.GetAllReturnOrderbyUserId)
router.route('/order/return/orderId/:id').get(orderController.GetReturnByOrderId);
// router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// router
//   .route("/admin/orders")
//   .get(  getAllOrders);

router
  .route("/admin/order/:id")
  .put(  orderController.updateOrder)
//   .delete(  deleteOrder);
router
  .route("/admin/orders")
  .get(  orderController.getAllOrders);

module.exports = router;
