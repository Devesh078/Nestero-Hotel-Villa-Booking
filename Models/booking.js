const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    // Link the booking to a specific listing
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing' 
    },
    fullName: String,
    address: String,
    phoneNumber: String,
    email: String,
    adults: {
        type: Number,
        required: true,
        min: 1
    },
    children: {
        type: Number,
        default: 0
    },
    // New field
  bookingDate: {
    type: Date,
    required: true
  },
    bookedAt: {
        type: Date,
        default: Date.now,
    },

});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;