const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const { required } = require("joi");

const listingSchema=new Schema({
    title:{
       type: String,
       required:true
    },   
    description:String,
    image:{
       url:String,
       filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    category: { type: String, required: true, enum: ["trending", "rooms", "iconic-cities", "mountains", "castles", "pools", "camping","farms","arctic","domes","boats"] }, // ✅ Added `category`

    geometry:{
        type:{
            type:String,
            enum:["Point"], //location.type must be point
            required:true,
        },
        coordinates:{
            type:[Number],
            required:true,
        },
    },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
}});
listingSchema.index({ title: "text", description: "text" })
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;