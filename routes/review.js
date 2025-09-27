const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Review = require("../Models/reviews.js");
const Listing = require("../Models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");   
const reviewController = require("../controllers/reviews.js");


//Reviews
//POST route

router.post(
    "/",
    isLoggedIn,
    validateReview, 
    wrapAsync(reviewController.createReview));


//Delete Review route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync (reviewController.destroyReview));

module.exports = router;