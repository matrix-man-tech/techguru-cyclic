const mongoose = require("mongoose")


const dbConnect = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        console.log("Database is connected successfully");
    } catch (error) {
        console.log(`Error ${error.message}`);
    }
}

module.exports = dbConnect