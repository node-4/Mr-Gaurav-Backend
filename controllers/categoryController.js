const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/CategoryModel");
const SubCategory = require("../models/SubCategory");
const { singleFileHandle } = require("../utils/fileHandle");

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    // const imagesLinks = await singleFileHandle(req.file,req);

    // const name = req.file ? req.file.filename : null;
    //  req.body.image = `${process.env.IMAGE_BASE_URL}/${req.file.filename}`
    const data = {
        name: req.body.name,
        image: req.body.image,
        categoryType: req.body.categoryType,
    };
    console.log(data);
    const category = await Category.create(data);
    res.status(201).json({
        success: true,
        category,
    });
});

exports.getCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find({});
    res.status(201).json({
        success: true,
        categories,
    });
});

exports.getCategoriesbasedonMaincategories = catchAsyncErrors(
    async (req, res, next) => {
        const categories = await Category.find({ categoryType: req.params.categoryType});
        res.status(201).json({
            success: true,
            categories,
        });
    }
);
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) new ErrorHander("Category Not Found !", 400);

    category.name = req.body.name;
    category.image = req.body.image;
    await category.save();

    res.status(200).json({ message: "Updated Successfully" });
});

exports.removeCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) new ErrorHander("Category Not Found !", 404);

    const subCategory = await SubCategory.find({ parentCategory: id });

    subCategory.map(
        async (item) => await SubCategory.deleteOne({ _id: item.id })
    );

    category.remove();

    res.status(200).json({ message: "Category Deleted Successfully !" });
});

exports.createSubCategory = catchAsyncErrors(async (req, res, next) => {
    // const name = req.file ? req.file.filename : null;
    req.body.image = `${process.env.IMAGE_BASE_URL}/${req.file.filename}`;

    const subCategory = await SubCategory.create(req.body);
    res.status(201).json({
        success: true,
        subCategory,
    });
});

exports.updateSubCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);

    if (!subCategory) new ErrorHander("Sub Category Not Found !", 404);

    subCategory.subCategory = req.body.subCategory;

    await subCategory.save();
    res.status(200).json({ message: "Updated Successfully" });
});

exports.TotalCategory = async (req, res) => {
    try {
        const data = await Category.find();
        res.status(200).json({
            total: data.length,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};

exports.DeleteCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = await Category.findByIdAndDelete({ _id: req.params.id });
        await SubCategory.deleteMany({ parentCategory: req.params.id });
        res.status(200).json({
            message: "Deleted",
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});
