const offerController = require("../controllers/offer");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
const express = require("express");
const router = express.Router();
router.get("/admin/offer/:id", offerController.getId);
router.post("/admin/offer", offerController.getAll);
router.post("/admin/create",upload.single("image"),authorizeRoles("admin"),offerController.create);
router.patch("/admin/offer/:id",isAuthenticatedUser, authorizeRoles("admin"),offerController.update);
router.delete("/admin/offer/:id", isAuthenticatedUser, authorizeRoles("admin"),offerController.delete);

module.exports = router;