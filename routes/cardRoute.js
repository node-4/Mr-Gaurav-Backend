const express = require("express");
const {
    createPaymentCard,
    getPaymentCard,
    DeletePaymentCard,
    updatePaymentCard,
} = require("../controllers/cardController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router = express.Router();

router.route("/card/new").post(isAuthenticatedUser,createPaymentCard);
router.route("/card/update/:id").put(updatePaymentCard);
router.route("/card/getAllCard").get(isAuthenticatedUser,getPaymentCard);
router.route("/card/delete/:id").delete(DeletePaymentCard);

module.exports = router;
