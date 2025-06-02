import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

export const connectDB = async () => {
  try {
    const uri =
      ENV_VARS.NODE_ENV === "test"
        ? ENV_VARS.MONGO_URI_TEST
        : ENV_VARS.MONGO_URI;

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected to ${ENV_VARS.NODE_ENV} DB: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB: " + error.message);
    process.exit(1);
  }
};
