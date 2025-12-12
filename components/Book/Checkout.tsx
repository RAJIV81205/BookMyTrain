"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import Fare from "./Fare";
import { useBooking } from "@/context/BookingContext";
import { Train, Clock, User, Calendar } from "lucide-react";

export default function Checkout() {
  const { bookingData, setBookingData, removePassenger } = useBooking();
  const router = useRouter();
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPassengerForm, setShowPassengerForm] = useState(false);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData.trainNo || !bookingData.fromCode || !bookingData.toCode) {
      router.push("/dashboard");
      return;
    }

    if (bookingData.trainNo && bookingData.classCode && bookingData.selectedSeats.length === 0) {
      setShowSeatSelection(true);
      setBookingData({ currentStep: "seats" });
    } else if (bookingData.selectedSeats.length > 0 && bookingData.passengers.length === 0) {
      setShowPassengerForm(true);
      setBookingData({ currentStep: "passengers" });
    } else if (bookingData.passengers.length > 0) {
      setBookingData({ currentStep: "payment" });
    }
  }, [bookingData.trainNo, bookingData.classCode, bookingData.selectedSeats.length, bookingData.passengers.length]);

  const handleSeatsSelected = (seats: number[]) => {
    setBookingData({ selectedSeats: seats, currentStep: "passengers" });
    setShowSeatSelection(false);
    setShowPassengerForm(true);
  };

  const handlePassengerDetailsComplete = () => {
    setShowPassengerForm(false);
    setBookingData({ currentStep: "payment" });
  };

  const handleChangeSeat = () => {
    bookingData.passengers.forEach((p) => removePassenger(p.id));
    setBookingData({ selectedSeats: [], passengers: [], currentStep: "seats" });
    setShowSeatSelection(true);
  };

  const getBerthTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LB: "Lower Berth",
      MB: "Middle Berth",
      UB: "Upper Berth",
      SL: "Side Lower",
      SU: "Side Upper",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SeatSelectionModal isOpen={showSeatSelection} onClose={() => setShowSeatSelection(false)} onSeatsSelected={handleSeatsSelected} />

      {showPassengerForm && <PassengerDetailsForm selectedSeats={bookingData.selectedSeats} onComplete={handlePassengerDetailsComplete} />}

      {bookingData.currentStep === "payment" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
            <p className="text-gray-600">Review your journey details and proceed to payment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Journey & Passenger Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Journey Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Train className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Journey Details</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Train</span>
                      <span className="text-sm font-semibold text-gray-900">{bookingData.classCode} Class</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {bookingData.trainNo} - {bookingData.trainName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Departure</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{bookingData.fromStnName}</p>
                      <p className="text-sm text-gray-600">{bookingData.fromCode}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{bookingData.fromTime}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Arrival</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{bookingData.toStnName}</p>
                      <p className="text-sm text-gray-600">{bookingData.toCode}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{bookingData.toTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{bookingData.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Passenger Details</h2>
                    </div>
                    <button onClick={handleChangeSeat} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
                      Modify
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {bookingData.passengers.map((passenger, index) => (
                      <div key={passenger.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{passenger.name}</p>
                              <p className="text-sm text-gray-600">
                                {passenger.age} years • {passenger.gender}
                              </p>
                            </div>
                          </div>
                          <div className="ml-13 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Seat Number:</span>
                              <span className="ml-2 font-semibold text-gray-900">{passenger.seatNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Berth Type:</span>
                              <span className="ml-2 font-semibold text-gray-900">{getBerthTypeLabel(passenger.seatType)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="lg:col-span-1">
              <Fare />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
