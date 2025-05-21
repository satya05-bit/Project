const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js")
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const {index, renderNewForm, showListing, createListing, renderEditForm, updateListing, destroyListing, searchListing} = require("../controllers/listings.js");
const multer=require('multer');
const {storage,cloudinary}=require("../cloudConfig.js")
const upload=multer({ storage });

router.route("/")
.get( wrapAsync(index))
.post(isLoggedIn,
    upload.single("listing[image]"),    
    validateListing,
     wrapAsync(createListing));
    // .post( upload.single("listing[image]"), (req, res) => {
    //     console.log("req.file:", req.file);  // Should log file data
    //     console.log("req.body:", req.body);  // Should log form fields
    //     res.send("Check your console for logs!");
    // });


//new
router.get("/new",isLoggedIn, renderNewForm);
router.get("/search", async (req, res) => {
    console.log("✅ Search Route Hit!");
    try {
        let { q } = req.query; // Get search query from URL
        console.log("🔎 Search Query:", q);
        if (!q || q.trim() === "") {
            console.log("⚠️ Empty query, redirecting to /listings");
            return res.redirect("/listings");
        }
 // Redirect if empty

        const listings = await Listing.find({
            title: { $regex: q, $options: "i" } // Case-insensitive search
        });
        console.log("🔍 Listings Found:", listings);
        

        if (listings.length === 1) {
            const listingId = listings[0]._id;
            if (!mongoose.Types.ObjectId.isValid(listingId.toString())) {
                console.error("❌ Invalid Listing ID Detected!");
                return res.redirect("/listings?error=Invalid+Listing+ID");
            }

            console.log("✅ Redirecting to:", `/listings/${listingId}`);
            return res.redirect(`/listings/${listingId}`);
        }
        console.log("🖥 Rendering search results.");
        res.render("listing/index.ejs", { allListings: listings });
    }
 catch (error) {
        console.error("Search Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.route("/:id")
.get( wrapAsync(showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(destroyListing));


//edit
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(renderEditForm));



module.exports=router;