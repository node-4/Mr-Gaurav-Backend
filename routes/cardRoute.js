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

router.route("/admin/card/new").post(createPaymentCard);
router.route("/admin/card/update/:id").put(updatePaymentCard);
router.route("/card/getAllCard").get(getPaymentCard);
router.route("/card/delete/cat/:id").delete(DeletePaymentCard);

module.exports = router;
