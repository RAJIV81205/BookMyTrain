"use client";
import { useBooking } from "@/context/BookingContext";

export default function Checkout() {
  const { bookingData } = useBooking();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Ticket</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">From Station</label>
              <p className="text-lg text-gray-800">{bookingData.fromCode || "Not selected"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">To Station</label>
              <p className="text-lg text-gray-800">{bookingData.toCode || "Not selected"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Travel Date</label>
              <p className="text-lg text-gray-800">{bookingData.date || "Not selected"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Train Number</label>
              <p className="text-lg text-gray-800">{bookingData.trainNo || "Not selected"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Class</label>
              <p className="text-lg text-gray-800">{bookingData.classCode || "Not selected"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fare</label>
              <p className="text-lg text-gray-800">{bookingData.fare ? `₹${bookingData.fare}` : "Not selected"}</p>
            </div>
          </div>
          
          {!bookingData.trainNo && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Please select a train from the search results to proceed with booking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
