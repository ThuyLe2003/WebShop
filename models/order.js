const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
        type: mongoose.ObjectId,
        required: true
    },
    items: [{
        product: Schema.Types.Mixed,
        quantity: {
            type: Number,
            required: true
        }
    }]
});

orderSchema.set("toJSON", { virtuals: false, versionKey: false});
const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;