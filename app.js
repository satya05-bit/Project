const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}


// console.log("Environment Variables Loaded:");
// console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
// console.log("CLOUD_API_KEY:", process.env.CLOUD_API_KEY);
// console.log("CLOUD_API_SECRET:", process.env.CLOUD_API_SECRET);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl=process.env.ATLASDB_URL; 

const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err)
})

const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24 *60 * 60 * 1000,
        maxAge:7 * 24 *60 * 60 * 1000,
        httpOnly:true,
    }
}


main().then(() => {
    console.log("connected to db");
})
    .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(dbUrl)
              
}

app.get("/", (req, res) => {
    res.send("Welcome to backend API!");
});


app.use(session(sessionOption));

app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
})

// app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
//     res.status(204).end(); // Respond with an empty 204 No Content
// });

// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//         email:"satya@gmail.com",
//         username:"satya",       
//     })
//    let registeredUser=await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// })

app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter);

app.use((req, res, next) => {
    console.log(`🛠 Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing")


// })
app.all(/.*/, (req, res, next) => {
    // if (req.originalUrl.includes("/.well-known/appspecific/com.chrome.devtools.json")) {
    //     return res.status(204).end(); // Silently ignore the request
    // }

   // console.log(`🚨 404 Error Triggered for URL: ${req.originalUrl}, Method: ${req.method}`);
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    console.log("error details:",err)
    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");

});
