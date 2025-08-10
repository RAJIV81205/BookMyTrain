import mongoose from "mongoose";

const Admin = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: () => Math.random().toString(36).slice(-8) },
    mobile: { type: Number, required: true, unique: true },
    isAdmin : { type: Boolean, default: false , required: true },
    dateOfBirth:{type:String , required:true},
    createdAt: { type: String, default: new Date().toLocaleString("en-IN") }
})

export default mongoose.models.Admin ||  mongoose.model("Admin", Admin);