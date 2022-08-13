const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    ordername: {
        type: String,
        required: true,
    },
    createddate: {
        type: Date,
        default: Date.now(),
    },
    updateddate: {
        type: Date,
        default: Date.now(),
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
        required: true,
    }
})