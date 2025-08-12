import mongoose from "mongoose";

const Booking = new mongoose.Schema({
    pnr: {type: String || Number , required: true},
    passengerList : {type: Array , required: true},
    trainNumber: {type: String || Number , required: true},
    trainName: {type: String , required: true},
    dateOfJourney: {type: String , required: true},
    from: {type: String , required: true},
    to: {type: String , required: true},
    coach: {type: String , required: true},
    seatNumber: {type: Array , required: true},
    fare: {type: Number , required: true},

})

export default mongoose.models.Booking || mongoose.model("Booking", Booking)