import mongoose from "mongoose";

const train = new mongoose.Schema({
    trainNo : {type : "Number" ,  required : true},
    trainName : {type : "String" ,  required : true},
    classes : {type : "Object" ,  required : true},
    addedDate : {type : "Date" ,  required : true , default: new Date().toLocaleDateString("en-IN")}
})

export default mongoose.models.Train || mongoose.model("Train", train);