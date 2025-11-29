const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../Models/listing.js");
const {isLoggedIn, isOwner, validateListing}= require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudconfig.js");
const upload = multer({storage});

router.use((req, res, next) => {
  console.log("➡️  ROUTE HIT:", req.method, req.originalUrl);
  next();
});

// -----------------------------------------------------
// 1. SPECIFIC, NON-ID-BASED ROUTES 
// -----------------------------------------------------

// create (Index) Route
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createlisting)
);

// New Route (e.g., /listings/new)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search route (e.g., /listings/search?q=...)
router
.get("/search",
    wrapAsync(async (req, res)=>{
        const {q} = req.query;

        console.log("Search request received.");
        console.log("Query parameter 'q':", q);
        
        if(!q){
            return res.json([]); // if no search term , return empty array
        }

        const results = await Listing.find({
            $or:[
                {title :{$regex:q, $options: "i"}},
                {description :{$regex:q, $options:"i"}}
            ]
        });

        res.json(results);
    })
);

// -----------------------------------------------------
// 2. SPECIFIC, TWO-SEGMENT ROUTES (e.g., /:id/edit, /:id/reserve)
// -----------------------------------------------------

// Edit route (e.g., /listings/12345/edit)
router.get(
    "/:id/edit" ,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

// Route to render the booking confirmation form page (e.g., /listings/12345/confirm-booking)
router.get("/:id/confirm-booking", async (req, res, next) => { // Added 'next' for error handling
    let { id } = req.params;
    console.log(`✅ ATTEMPTING CONFIRM BOOKING ROUTE FOR ID: ${id}`);
    
    try {
        const listing = await Listing.findById(id); 

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        // Render the new EJS file with the listing data
        res.render("listings/confirmBooking.ejs", { listing });
        
    } catch (err) {
        // This will log the error and display your error page (error.ejs)
        console.error("❌ CRASH ERROR in confirm-booking route:", err);
        next(err); 
    }
});

// GET route to show the reservation form
router.get("/:id/reserve", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id); 
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // This renders the reserve form
    res.render("listings/reserve.ejs", { listing }); 
}));

// POST route to handle the final booking submission
router.post("/:id/reserve", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    
    // Process and save req.body.booking here
    console.log("Booking details received:", req.body.booking); 
    
    req.flash("success", "Reservation Request Sent! Instructions will be emailed shortly.");
    res.redirect(`/listings/${id}`); // Redirect back to the listing detail page
}));


// -----------------------------------------------------
// 3. GENERAL ID-BASED ROUTES (Show, Update, Delete) - MUST COME LAST
// -----------------------------------------------------

//show route, update route, delete route
router
.route("/:id")
.get(wrapAsync(listingController.ShowListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updatelisting)
)
.delete(
    isLoggedIn,
    isOwner,
    wrapAsync (listingController.deletelisting)
);


module.exports = router;