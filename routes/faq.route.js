const faq = require("../controllers/faq.controller");
const express = require('express');
const router = express();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
router.post("/admin", faq.create);
router.patch("/admin/:id",faq.update);
router.get("/admin/:id", faq.getId);
router.post("/admin/faq", faq.get);
router.delete("/admin/:id",faq.delete);
router.get("/:id", faq.getId);
router.get("/", faq.get);
module.exports = router;