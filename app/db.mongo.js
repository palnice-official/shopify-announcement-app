import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env file");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }
    if (!cached.promise) {
        console.log("Creating new MongoDB connection with URI:", MONGODB_URI);
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            console.log("✅ MongoDB connected successfully");
            const dbName = mongoose.connection.name;
            console.log("Connected to database:", dbName);
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;