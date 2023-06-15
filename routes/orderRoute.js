const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/checkout", orderController.checkout);
router.post("/place-order", isAuthenticatedUser, orderController.placeOrder);
router.post('/place-order/cod', isAuthenticatedUser, orderController.placeOrderCOD)
router.get("/orders/me", isAuthenticatedUser, orderController.getOrders)
// router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(orderController.getSingleOrder);
router.route('/order/return/:id').post(orderController.orderReturn);
router.route('/order/return/:userId').get(orderController.GetAllReturnOrderbyUserId)
router.route('/order/return/orderId/:id').get(orderController.GetReturnByOrderId);
// router.route("/orders/me").get(isAuthenticatedUser, myOrders);
// router
//   .route("/admin/orders")
//   .get(  getAllOrders);
router
  .route("/admin/order/:id")
  .put(orderController.updateOrder)
//   .delete(  deleteOrder);
router
  .route("/admin/orders")
  .get(orderController.getAllOrders);
router.post("/createTransaction/:id", isAuthenticatedUser, orderController.createTransaction);
router.post("/admin/createTransaction/:id", isAuthenticatedUser, authorizeRoles("admin"), orderController.createTransactionbyAdmin);
router.get("/allTransaction", orderController.allTransaction);
router.get("/allTransactionUser", isAuthenticatedUser, orderController.allTransactionUser);
router.get("/allcreditTransactionUser", isAuthenticatedUser, orderController.allcreditTransactionUser);
router.get("/allDebitTransactionUser", isAuthenticatedUser, orderController.allDebitTransactionUser);
router.post("/orderAmountRefund/:orderReturnId", isAuthenticatedUser, orderController.orderAmountRefund);
router.get("/allRefundrequest", isAuthenticatedUser, orderController.allRefundrequest);
router.get("/allRefundrequestbyAdmin", orderController.allRefundrequestbyAdmin);
router.get("/viewRefundrequest/:id", orderController.viewRefundrequest);
router.put("/acceptRefundrequest/:id", isAuthenticatedUser, orderController.acceptRefundrequest);
router.put("/rejectRefundrequest/:id", isAuthenticatedUser, orderController.rejectRefundrequest);
router.get("/getInvoiceByOrderId/:OrderId", orderController.getInvoiceByOrderId);
module.exports = router;
