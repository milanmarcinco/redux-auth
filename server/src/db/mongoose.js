const mongoose = require("mongoose");

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Successfuly connected to the database...");
  } catch (err) {
    console.log("An error occurred while trying to connect to the database.");
    console.log("Trying again in 30 seconds");
    setTimeout(() => {
      connectWithRetry();
    }, 30 * 1000);
  }
};

connectWithRetry();
