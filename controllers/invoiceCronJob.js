const cronJob = require("cron").CronJob;
let order = require("../models/orderModel");
const Invoice = require('../models/invoice_model');
// new cronJob('0 */2 * * *', async function () {
new cronJob("*/30 * * * * *", async function () {
        let findOrder = await order.find({});
        if (findOrder.length == 0) {
                console.log("No data found");
        } else {
                for (let i = 0; i < findOrder.length; i++) {
                        let findinvoice = await Invoice.findOne({ OrderId: findOrder[i]._id, invoiceNumber: generateInvoiceNumber(), orderStatus: findOrder[i].orderStatus, amount: findOrder[i].grandTotal, status: findOrder[i].paymentStatus, })
                        if (findinvoice) {
                                console.log("already");
                        } else {
                                let obj = {
                                        OrderId: findOrder[i]._id,
                                        invoiceNumber: generateInvoiceNumber(),
                                        invoiceDate: new Date(Date.now()),
                                        orderStatus: findOrder[i].orderStatus,
                                        amount: findOrder[i].grandTotal,
                                        status: findOrder[i].paymentStatus,
                                        invoiceDate: new Date(Date.now())
                                }
                                const result = await Invoice.create(obj)
                        }
                }
        }
}).start();
// }).stop()
function generateInvoiceNumber() {
        const length = 8;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
}
