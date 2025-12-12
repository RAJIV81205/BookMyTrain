"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import Fare from "./Fare";
import { useBooking } from "@/context/BookingContext";
import { Train, Clock, MapPin, Calendar, Users, Ticket, ArrowRight, Edit2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Checkout() {
  const { bookingData, setBookingData, removePassenger, validateBooking } = useBooking();
  const router = useRouter();
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
    toast.success(`${seats.length} seat${seats.length > 1 ? "s" : ""} selected successfully!`);
  };

  const handlePassengerDetailsComplete = () => {
    const validation = validateBooking();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error("Please complete all passenger details correctly");
      return;
    }
    setValidationErrors([]);
    setShowPassengerForm(false);
    setBookingData({ currentStep: "payment" });
    toast.success("Passenger details saved!");
  };

  const handleChangeSeat = () => {
    bookingData.passengers.forEach((p) => removePassenger(p.id));
    setBookingData({ selectedSeats: [], passengers: [], currentStep: "seats" });
    setShowSeatSelection(true);
    toast("Select new seats", { icon: "ℹ️" });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString;
  };

  return (
    <div className="space-y-6">
      {/* Journey Details Card */}
      <section className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Train className="w-5 h-5 text-gray-700" />
            Journey Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review your booking information</p>
        </div>

        <div className="p-6">
          {/* Route Information */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
              {/* Departure */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white shadow-sm"></div>
                    <div className="w-0.5 h-16 bg-gray-300 my-2"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</div>
                      <div className="text-2xl font-bold text-gray-900">{bookingData.fromCode || "---"}</div>
                      <div className="text-sm text-gray-600 mt-1 truncate">{bookingData.fromStnName || "---"}</div>
                      {bookingData.fromTime && (
                        <div className="inline-flex items-center mt-2 gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">{formatTime(bookingData.fromTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Train Info in Middle */}
              <div className="flex items-center justify-center my-4 md:my-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Train className="w-5 h-5" />
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-500">Train</div>
                      <div className="text-sm font-bold">{bookingData.trainNo || "---"}</div>
                      <div className="text-xs text-gray-600 mt-0.5 max-w-[120px] truncate">{bookingData.trainName || "---"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="flex-1 w-full md:w-auto md:text-right md:ml-auto">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To</div>
                <div className="text-2xl font-bold text-gray-900">{bookingData.toCode || "---"}</div>
                <div className="text-sm text-gray-600 mt-1 truncate">{bookingData.toStnName || "---"}</div>
                {bookingData.toTime && (
                  <div className="inline-flex items-center mt-2 gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm md:ml-auto">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{formatTime(bookingData.toTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div className="text-xs font-semibold text-gray-600 uppercase">Travel Date</div>
              </div>
              <div className="font-bold text-gray-900">{formatDate(bookingData.date)}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-gray-600" />
                <div className="text-xs font-semibold text-gray-600 uppercase">Class</div>
              </div>
              <div className="font-bold text-gray-900">{bookingData.classCode || "---"}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                <div className="text-xs font-semibold text-gray-600 uppercase">Passengers</div>
              </div>
              <div className="font-bold text-gray-900">
                {Math.max(bookingData.passengers.length, bookingData.selectedSeats.length, 0)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <div className="text-xs font-semibold text-gray-600 uppercase">Seats</div>
              </div>
              <div className="font-bold text-gray-900">{bookingData.selectedSeats.length || 0}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seat Selection Card */}
          {bookingData.selectedSeats.length === 0 ? (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-gray-700" />
                      Seat Selection
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Choose your preferred seats</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSeatSelection(true)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Select Seats
                </button>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Selected Seats</h3>
                  </div>
                  <button
                    onClick={handleChangeSeat}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1.5 hover:underline"
                  >
                    <Edit2 className="w-4 h-4" />
                    Change
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {bookingData.selectedSeats.map((seat) => (
                    <div
                      key={seat}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-gray-700"
                    >
                      Seat {seat}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Passenger Details Form */}
          {showPassengerForm && bookingData.selectedSeats.length > 0 && (
            <PassengerDetailsForm
              selectedSeats={bookingData.selectedSeats}
              onComplete={handlePassengerDetailsComplete}
            />
          )}

          {/* Passenger Summary */}
          {bookingData.passengers.length > 0 && !showPassengerForm && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Passenger Details</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowPassengerForm(true);
                      setBookingData({ currentStep: "passengers" });
                    }}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1.5 hover:underline"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {bookingData.passengers.map((passenger, idx) => (
                    <div
                      key={passenger.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{passenger.name}</div>
                              <div className="text-sm text-gray-500">Seat {passenger.seatNumber}</div>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">Age:</span>{" "}
                              <span className="font-semibold text-gray-700">{passenger.age} years</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Gender:</span>{" "}
                              <span className="font-semibold text-gray-700">{passenger.gender}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-800 mb-2">Please fix the following issues:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Fare Summary */}
        <div className="lg:col-span-1">
          <Fare />
        </div>
      </div>

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={showSeatSelection}
        onClose={() => {
          setShowSeatSelection(false);
          if (bookingData.selectedSeats.length === 0) {
            // If no seats selected and user closes, maybe redirect or show message
          }
        }}
        onSeatsSelected={handleSeatsSelected}
      />
    </div>
  );
}
