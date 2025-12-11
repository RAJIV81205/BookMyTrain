"use client";

import { useBooking } from "@/context/BookingContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import {
  Train,
  Clock,
  MapPin,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";

export default function Checkout() {
  const { bookingData, setBookingData } = useBooking();
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  let cashfree:any;
  var initializeSDK = async function () {
    cashfree = await load({
      mode: "sandbox",
    });
  };
  initializeSDK();

  // helper to get token from localStorage or cookie
  const getToken = () => {
    try {
      const lsToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (lsToken) return lsToken;
      // fallback: parse cookie named "token"
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
      return null;
    } catch (e) {
      console.warn("Failed to read token:", e);
      return null;
    }
  };

  // Check if booking data is present, redirect if not
  useEffect(() => {
    if (!bookingData.trainNo || !bookingData.fromCode || !bookingData.toCode) {
      router.push("/dashboard");
      return;
    }

    // Show seat selection modal when component mounts and train is selected
    if (
      bookingData.trainNo &&
      bookingData.classCode &&
      bookingData.selectedSeats.length === 0
    ) {
      setShowSeatSelection(true);
      setBookingData({ currentStep: "seats" });
    } else if (
      bookingData.selectedSeats.length > 0 &&
      bookingData.passengers.length === 0
    ) {
      setBookingData({ currentStep: "passengers" });
    } else if (bookingData.passengers.length > 0) {
      setBookingData({ currentStep: "payment" });
    }
  }, [
    bookingData.trainNo,
    bookingData.classCode,
    bookingData.selectedSeats.length,
    bookingData.passengers.length,
    bookingData.fromCode,
    bookingData.toCode,
    router,
  ]);

  const handleSeatsSelected = (seats: number[]) => {
    setBookingData({ selectedSeats: seats, currentStep: "passengers" });
    console.log("seats selected", seats);
    setShowSeatSelection(false);
    setShowPassengerForm(true);
  };

  const handlePassengerDetailsComplete = () => {
    setShowPassengerForm(false);
    setBookingData({ currentStep: "payment" });
  };

  const handleChangeSeat = () => {
    setBookingData({ selectedSeats: [], passengers: [], currentStep: "seats" });
    setShowSeatSelection(true);
  };

  const handleModalClose = () => {
    setShowSeatSelection(false);
    // If no seats are selected and train is selected, keep current step as "seats"
    if (bookingData.trainNo && bookingData.selectedSeats.length === 0) {
      setBookingData({ currentStep: "seats" });
    }
  };

  // -------------------------------
  // createOrder -> send amount & token to backend
  // -------------------------------
 // Replace your createOrder + doPayment with this combined function
const createOrderAndCheckout = async () => {
  setError(null);

  if (!bookingData.fare) return setError("Fare not selected.");
  if (!bookingData.passengers?.length) return setError("Add passengers first.");

  const amount = Math.round(Number(bookingData.fare) * bookingData.passengers.length);

  const token = getToken();
  if (!token) {
    router.push("/login");
    return;
  }

  setLoading(true);

  try {
    // 1) Create order in backend
    const resp = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, token }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      setError(data?.error || "Order creation failed");
      setLoading(false);
      return;
    }

    const cashfreeResp = data.cashfree;
    const paymentSessionId = cashfreeResp?.payment_session_id;

    if (!paymentSessionId) {
      setError("Payment session not returned from backend");
      setLoading(false);
      return;
    }

    // 2) Load Cashfree SDK
    const cfMode = (process.env.NEXT_PUBLIC_CASHFREE_MODE as "TEST" | "PROD") || "TEST";
    const cfClientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;

    const cashfree = await load({
      mode: cfMode,
      clientId: cfClientId,
    });

    // 3) Open payment modal
    const checkoutOptions = {
      paymentSessionId,
      redirectTarget: "_modal",
      mode: cfMode, // 🔥 IMPORTANT — REQUIRED by Cashfree SDK
    };

    const result = await cashfree.checkout(checkoutOptions);

    if (result.error) {
      console.log("Cashfree checkout closed/error:", result.error);
      setError("Payment cancelled or failed.");
    } else if (result.paymentDetails) {
      console.log("Payment completed:", result.paymentDetails);
    //   router.push("/bookings");
    }

  } catch (err) {
    console.error("Checkout error:", err);
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Journey Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review your booking information
            </p>
          </div>

          {/* Journey Route Card */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                {/* Source Station */}
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-gray-600 rounded-full mr-2"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      Departure
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {bookingData.fromCode || "---"}
                      </h3>
                      {bookingData.fromStnName && (
                        <p className="text-sm text-gray-600">
                          {bookingData.fromStnName}
                        </p>
                      )}
                    </div>
                    {bookingData.fromTime && (
                      <div className="inline-flex items-center bg-gray-800 text-white px-3 py-1.5 rounded text-sm font-medium">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {bookingData.fromTime}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connecting Line with Train Icon */}
                <div className="flex-1 flex flex-col items-center px-6">
                  <div className="relative w-full flex items-center">
                    <div className="w-full h-0.5 bg-gray-400"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-400 rounded-full p-2">
                      <Train className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  {bookingData.trainName && (
                    <div className="mt-3 bg-white px-3 py-1.5 rounded border border-gray-300">
                      <span className="text-xs text-gray-700 font-medium">
                        {bookingData.trainName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Destination Station */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end mb-3">
                    <span className="text-xs font-medium text-gray-600 uppercase mr-2">
                      Arrival
                    </span>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {bookingData.toCode || "---"}
                      </h3>
                      {bookingData.toStnName && (
                        <p className="text-sm text-gray-600">
                          {bookingData.toStnName}
                        </p>
                      )}
                    </div>
                    {bookingData.toTime && (
                      <div className="flex justify-end">
                        <div className="inline-flex items-center bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {bookingData.toTime}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Travel Date
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.date
                    ? new Date(bookingData.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Not selected"}
                </p>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Train className="w-4 h-4 text-gray-600" />
                </div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Train Number
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.trainNo || "Not selected"}
                </p>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Class
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.classCode || "Not selected"}
                </p>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Fare
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.fare ? `₹${bookingData.fare}` : "Not selected"}
                </p>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Passengers
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.passengers.length ||
                    bookingData.selectedSeats.length ||
                    "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats Display */}
        {bookingData.selectedSeats.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Selected Seats
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bookingData.selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium"
                    >
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleChangeSeat}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium underline"
              >
                Change Seats
              </button>
            </div>
          </div>
        )}

        {!bookingData.trainNo && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-300 rounded-lg">
            <p className="text-orange-800">
              Please select a train from the search results to proceed with
              booking.
            </p>
          </div>
        )}

        {/* Show seat selection button if train is selected but no seats selected */}
        {bookingData.trainNo &&
          bookingData.classCode &&
          bookingData.selectedSeats.length === 0 &&
          !showSeatSelection && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    Select Your Seats
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choose your preferred seats to continue with booking
                  </p>
                </div>
                <button
                  onClick={() => setShowSeatSelection(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Select Seats
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Passenger Details Form */}
      {showPassengerForm && bookingData.selectedSeats.length > 0 && (
        <PassengerDetailsForm
          selectedSeats={bookingData.selectedSeats}
          onComplete={handlePassengerDetailsComplete}
        />
      )}

      {/* Booking Summary */}
      {bookingData.currentStep === "payment" &&
        bookingData.passengers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Summary
            </h3>

            <div className="space-y-3">
              {bookingData.passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <h4 className="font-medium text-gray-800 mb-2">
                    Passenger {index + 1} - Seat {passenger.seatNumber}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">
                        {passenger.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <p className="font-medium text-gray-900">
                        {passenger.age}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <p className="font-medium text-gray-900">
                        {passenger.gender}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹
                  {bookingData.fare
                    ? Math.round(
                        Number(bookingData.fare) * bookingData.passengers.length
                      )
                    : 0}
                </span>
              </div>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                className={`w-full px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
                }`}
                onClick={createOrderAndCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        )}

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={showSeatSelection}
        onClose={handleModalClose}
        onSeatsSelected={handleSeatsSelected}
      />
    </div>
  );
}
