const mongoose = require("mongoose");
const Listing = require("../Models/listing.js");
const initData = require("../data.js");

// for connection of mongoose
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


const initDB = async () => {
    // Delete all existing listings to avoid duplicates
    await Listing.deleteMany({});
    
    // Assign a hardcoded owner ID to each listing before insertion.
    // In a real application, this would be the ID of the logged-in user.
    initData.data = initData.data.map((obj) => ({...obj, owner: "68b58b66e7be876d3a38b4a1" }));
    
    // Insert the modified data into the database
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();
