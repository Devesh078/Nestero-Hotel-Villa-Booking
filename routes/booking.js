const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require('../Models/listing');
const emailUtility = require('../utils/email');
const Booking = require('../Models/booking'); //Ensure path is correct

console.log("Booking model loaded:", Booking && Booking.modelName);

router.post("/:listingId", wrapAsync(async (req, res) => {
  const { listingId } = req.params;
  const { name, address, phone, email, adults, children, bookingDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    req.flash("error", "Invalid listing ID format.");
    return res.redirect(`/listings`);
  }
  const newBooking = new Booking({
    listing: listingId,
    fullName: name,
    address,
    phoneNumber: phone,
    email: email,
    adults: adults,
    children: children,
    bookingDate: bookingDate
  });

  try {
    console.log("Saving booking...");
    const savePromise = newBooking.save();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database write timed out (10s).")), 10000)
    );

    await Promise.race([savePromise, timeoutPromise]);
    console.log("Booking saved successfully!");

    const confirmedListing = await Listing.findById(listingId, 'title');

    const bookingDetails = {
      fullName: name,
      email: email,
      listingTitle: confirmedListing ? confirmedListing.title : 'Destination',
      bookingId: newBooking._id,
      adults: newBooking.adults,
      children: newBooking.children,
      bookingDate: newBooking.bookingDate
    };

    await emailUtility.sendBookingConfirmation(email, bookingDetails);

    req.flash("success", "Booking Confirmed! A confirmation email has been sent.");
    res.redirect(`/listings/${listingId}`);

  } catch (error) {
    console.error("Booking Save Error:", error.message);
    req.flash("error", `Booking failed: ${error.message}`);
    res.redirect(`/listings/${listingId}/confirm-booking`);
  }
}));

module.exports = router;
