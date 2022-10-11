const mongoose = require("mongoose");

//default export
module.exports = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URL
    );
    console.log("Database connected successfully!!");
  } catch (e) {
    console.log("Something went wrong", e);
  }
};
