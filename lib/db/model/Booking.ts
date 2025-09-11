import mongoose from "mongoose";

const PassengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  seatNumber: { type: String, required: true }, // e.g., "B2-23"
  seatType: { 
    type: String, 
    enum: ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"], 
    required: true 
  }
}, { _id: false });

const JourneySchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  pnr: { type: String, required: true, unique: true }, // Always string for consistency
  trainNumber: { type: String, required: true },
  trainName: { type: String, required: true },
  dateOfJourney: { type: Date, required: true },
  coach: { type: String, required: true }, // e.g., "B2"

  passengers: { type: [PassengerSchema], required: true }, // List of passengers

  journey: { type: JourneySchema, required: true }, // Full journey info

  fare: { type: Number, required: true },
  bookingStatus: { 
    type: String, 
    enum: ["CONFIRMED", "WAITING", "CANCELLED"], 
    default: "CONFIRMED" 
  },
  
  paymentDetails: {
    transactionId: { type: String, required: true },
    paymentMode: { type: String, enum: ["UPI", "Card", "NetBanking", "Wallet"], required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "SUCCESS" }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
