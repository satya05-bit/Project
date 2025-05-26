require('dotenv').config();
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


//const mongo_Url="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl="mongodb+srv://satyabratadas960:0ioOlMgug8tDQxy3@cluster0.zrdzmrm.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0";

if (!dbUrl) {
    console.error("❌ Error: Missing MongoDB connection string (ATLASDB_URL)!");
    process.exit(1); // ✅ Exit to prevent further errors
}

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}

const initDb=async()=>{
    await Listing.deleteMany({});
       
    console.log("data was initialized");
};
initDb();