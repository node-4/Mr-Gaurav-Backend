const banner = require('../models/banner')
const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "https-www-pilkhuwahandloom-com",
    api_key: "886273344769554",
    api_secret: "BVicyMGE04PrE7vWSorJ5txKmPs",
});


exports.AddBanner = async (req, res) => {
    try {
        let image;
        if (req.body.image) {
            var result = await cloudinary.uploader.upload(req.body.image, { resource_type: "auto" });
            image = result.secure_url;
        }
        const data = {
            image: image,
            desc: req.body.desc,
            categoryType: req.body.categoryType
        }
        const Data = await banner.create(data);
        res.status(200).json({
            message: "Banner is Addded ",
            data: Data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find({ categoryType: req.params.categoryType });
        res.status(200).json({
            message: "All Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.getById = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        res.status(200).json({
            message: "One Banners",
            data: Banner
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({
            message: "Delete Banner ",
        },)
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}