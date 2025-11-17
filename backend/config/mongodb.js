import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("❌ MongoDB Error:", err.message);
    });

    // Get base URI from ENV or use local
    let base = process.env.MONGODB_URI?.trim();
    if (!base) base = "mongodb://127.0.0.1:27017/e-commerce";

    // If no DB name provided, append default
    const hasDbName = /\/[^\/?]+(?:\?|$)/.test(base);
    let uri = hasDbName ? base : `${base.replace(/\/$/, "")}/e-commerce`;

    // Add retryWrites & w=majority if missing
    const hasQueryHints =
      /[?&]retryWrites=/.test(uri) || /[?&]w=/.test(uri);

    if (!hasQueryHints) {
      uri += uri.includes("?")
        ? "&retryWrites=true&w=majority"
        : "?retryWrites=true&w=majority";
    }

    // Final connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

  } catch (error) {
    console.log("❌ MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;
