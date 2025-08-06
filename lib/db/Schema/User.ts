import mongoose from "mongoose";
import { de } from "zod/locales";

const User = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true , default: "123456"},
  createdAt: {type: Date, default: Date.now}
});

export default mongoose.model("User", User);
