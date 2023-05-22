const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = require("express").Router();
const cartController = require("../controllers/cartController");

router.post("/:id",  cartController.addToCart);

router.put("/:id", isAuthenticatedUser,cartController.updateQuantity);

router.get("/:id", isAuthenticatedUser,  cartController.getCart);

router.put("/coupon",  isAuthenticatedUser, isAuthenticatedUser,

cartController.applyCoupon)


module.exports = router;