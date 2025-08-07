import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: () => Math.random().toString(36).slice(-8) },
  dateOfBirth: { type: String, required: true },
  mobile: { type: Number, required: true, unique: true },
  createdAt: { type: String, default: new Date().toLocaleString("en-IN") }
});

export default mongoose.model("User", User);
