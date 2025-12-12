"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import Fare from "./Fare";
import { useBooking } from "@/context/BookingContext";
import { Train, Clock } from "lucide-react";

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



  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Journey Details</h2>
          <p className="text-sm text-gray-500">Confirm the details below before proceeding</p>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-sky-600" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Departure</div>
                      <div className="font-semibold text-lg">{bookingData.fromCode || "---"}</div>
                      <div className="text-sm text-gray-600">{bookingData.fromStnName}</div>
                      {bookingData.fromTime && (
                        <div className="inline-flex items-center mt-2 text-xs bg-white border rounded px-2 py-1">
                          <Clock className="w-4 h-4 mr-1" /> {bookingData.fromTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-white">
                    <Train className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{bookingData.trainName}</div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-xs text-gray-500 uppercase">Arrival</div>
                  <div className="font-semibold text-lg">{bookingData.toCode || "---"}</div>
                  <div className="text-sm text-gray-600">{bookingData.toStnName}</div>
                  {bookingData.toTime && (
                    <div className="inline-flex items-center mt-2 text-xs bg-white border rounded px-2 py-1">
                      <Clock className="w-4 h-4 mr-1" /> {bookingData.toTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Travel Date</div>
                  <div className="font-medium">{bookingData.date ? new Date(bookingData.date).toLocaleDateString("en-IN") : "Not set"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Train No</div>
                  <div className="font-medium">{bookingData.trainNo || "---"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Class</div>
                  <div className="font-medium">{bookingData.classCode || "---"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Passengers</div>
                  <div className="font-medium">{Math.max(bookingData.passengers.length, bookingData.selectedSeats.length)}</div>
                </div>
              </div>
            </div>

            <div>
              {bookingData.selectedSeats.length === 0 ? (
                <div className="bg-white p-4 rounded border shadow-sm">
                  <button onClick={() => setShowSeatSelection(true)} className="w-full bg-sky-600 text-white py-2 rounded-lg">Select Seats</button>
                </div>
              ) : bookingData.passengers.length === 0 ? (
                <div className="bg-white p-4 rounded border shadow-sm">
                  <button onClick={() => setShowPassengerForm(true)} className="w-full bg-sky-600 text-white py-2 rounded-lg">Add Passengers</button>
                </div>
              ) : (
                <Fare />
              )}

              <div className="mt-4 text-xs text-gray-500">Secure payments · 99.9% uptime</div>
            </div>
          </div>
        </div>
      </section>

      {bookingData.selectedSeats.length > 0 && (
        <section className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Selected Seats</h3>
            <button className="text-sm underline" onClick={handleChangeSeat}>Change</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {bookingData.selectedSeats.map((s) => (
              <span key={s} className="px-3 py-1 bg-slate-100 border rounded">Seat {s}</span>
            ))}
          </div>
        </section>
      )}

      {showPassengerForm && bookingData.selectedSeats.length > 0 && (
        <PassengerDetailsForm selectedSeats={bookingData.selectedSeats} onComplete={handlePassengerDetailsComplete} />
      )}

      <SeatSelectionModal isOpen={showSeatSelection} onClose={() => setShowSeatSelection(false)} onSeatsSelected={handleSeatsSelected} />
    </div>
  );
}
