const staticContent = require('../models/staticContent');
exports.createAboutUs = async (req, res) => {
        try {
                const newAboutUs = {
                        title: req.body.title,
                        desc: req.body.desc,
                        type: "ABOUTUS"
                }
                const result = await staticContent.create(newAboutUs)
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: result });
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAboutUs = async (req, res) => {
        try {
                const result = await staticContent.find({ type: "ABOUTUS" });
                if (!result || result.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: result });

        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAboutUsById = async (req, res) => {
        try {
                const data = await staticContent.findById(req.params.id);
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateAboutUs = async (req, res) => {
        try {
                const data = await staticContent.findById(req.params.id);
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let title = req.body.title || data.title;
                        let desc = req.body.desc || data.desc;
                        const result = await staticContent.findByIdAndUpdate({ _id: req.params.id }, { $set: { title: title, desc: desc, type: data.type, } }, { new: true });
                        return res.status(200).json({ status: 200, message: "update successfully.", data: result });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteAboutUs = async (req, res) => {
        try {
                const result = await staticContent.findByIdAndDelete({ _id: req.params.id });
                res.status(200).json({ message: "ok" })
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};