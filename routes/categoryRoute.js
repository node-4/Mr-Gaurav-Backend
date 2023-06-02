const express = require("express");
const { createCategory, getCategories, createSubCategory, DeleteCategory, TotalCategory, getCategoriesbasedonMaincategories, updateCategory,} = require("../controllers/categoryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

const router = express.Router();

router.post("/admin/category/new",createCategory);

router.route("/admin/category/update/:id").put(updateCategory);
router.get("/admin/category/get/:categoryType",getCategoriesbasedonMaincategories);

router.route("/admin/subCategory/new").post(createSubCategory);

router.route("/catogory/getAllCategory").get(getCategories);

router.route("/admin/delete/cat/:id").delete(DeleteCategory);

router.route("/admin/total/cat").get(TotalCategory);

module.exports = router;
