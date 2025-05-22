require('dotenv').config();
const express=require("express");
const mongoose = require("mongoose");
const Listing=require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listing/index.ejs", { allListings });
}

module.exports.renderNewForm=(req, res) => {
    
    res.render("listing/new.ejs");
    
}
module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("❌ Invalid ObjectId:", id);
        return res.status(400).send("Invalid listing ID");
    }

    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
        }
})
    .populate("owner");
    if(!listing){
         req.flash("error","Listing you requested for does not exist !")
           res.redirect("/listings");
    } else{
    res.render("listing/show.ejs", { listing });
    }
}
module.exports.createListing=async (req, res, next) => {
   let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
        console.log("🌍 Geocoding Response:", JSON.stringify(response.body, null, 2)); // 🔎 Log Full Response

    
    let url=req.file.path;
    let filename=req.file.filename;
     console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
     newListing.image={url,filename};
     newListing.category= req.body.listing.category,
     newListing.geometry=response.body.features[0].geometry;
    
     let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created");
    res.redirect("/listings");
}
module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist !")
         return res.redirect("/listings");
   } 
   let originalImageUrl=listing.image.url;
   originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
   res.render("listing/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing=async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data")
    }
    let { id } = req.params;
    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    if(typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}
// module.exports.searchListing=async (req, res) => {
//     console.log("✅ Search Route Hit!");
//     try {
//         let { q } = req.query; // Get search query from URL
//         console.log("🔎 Search Query:", q);
//         if (!q) return res.redirect("/listings"); // Redirect if empty

//         const listings = await Listing.find({
//             title: { $regex: q, $options: "i" } // Case-insensitive search
//         });
//         console.log("🔍 Listings Found:", listings);
        

//         if (listings.length === 1 && mongoose.Types.ObjectId.isValid(listings[0]._id)) {
//             console.log("✅ Redirecting to:", `/listings/${listings[0]._id}`);
//             return res.redirect(`/listings/${listings[0]._id}`);
//         }


//         res.render("listing/index.ejs", { allListings: listings });
//     } catch (error) {
//         console.error("Search Error:", error);
//         res.status(500).send("Internal Server Error");
//     }
// }