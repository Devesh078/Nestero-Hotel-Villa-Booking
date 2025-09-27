const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../Models/listing.js");
const {isLoggedIn, isOwner, validateListing}= require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudconfig.js");
const upload = multer({storage});


//create
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createlisting)
);

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search route
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


//show route, delete route
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
    wrapAsync (listingController.deletelisting));


//Edit route
router.get(
    "/:id/edit" ,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));


module.exports = router;