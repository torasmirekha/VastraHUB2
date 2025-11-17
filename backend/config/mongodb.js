import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true)
    mongoose.connection.on('connected', () => {
      console.log("DB Connected")
    })
    mongoose.connection.on('error', (err) => {
      console.log("DB Connection Error:", err.message)
    })

    const base = String(process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017'
    const hasDbName = /\/[^\/?]+(?:\?|$)/.test(base)
    let uri = hasDbName ? base : `${base.replace(/\/$/, '')}/e-commerce`
    const hasQueryHints = /[?&]retryWrites=/.test(uri) || /[?&]w=/.test(uri)
    if (!hasQueryHints) {
      uri += uri.includes('?') ? '&retryWrites=true&w=majority' : '?retryWrites=true&w=majority'
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })
  } catch (error) {
    console.log('Mongo connection failed:', error.message)
  }
}

export default connectDB;