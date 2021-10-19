const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (err) {
    console.log(`MongoDB connection error: ${err}`);
  }
};

module.exports = connectToDb;
