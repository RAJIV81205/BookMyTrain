"use client";

import { useBooking } from "@/context/BookingContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import { Train, Clock, MapPin, ArrowRight, Users, Edit3, Calendar, CreditCard } from "lucide-react";



export default function Checkout() {
    const { bookingData, setBookingData } = useBooking();
    const [showSeatSelection, setShowSeatSelection] = useState(false);
    const [showPassengerForm, setShowPassengerForm] = useState(false);
    const router = useRouter();


    // Check if booking data is present, redirect if not
    useEffect(() => {
        if (!bookingData.trainNo || !bookingData.fromCode || !bookingData.toCode) {
            router.push("/dashboard");
            return;
        }

        // Show seat selection modal when component mounts and train is selected
        if (bookingData.trainNo && bookingData.classCode && bookingData.selectedSeats.length === 0) {
            setShowSeatSelection(true);
            setBookingData({ currentStep: "seats" });
        } else if (bookingData.selectedSeats.length > 0 && bookingData.passengers.length === 0) {
            setBookingData({ currentStep: "passengers" });
        } else if (bookingData.passengers.length > 0) {
            setBookingData({ currentStep: "payment" });
        }
    }, [bookingData.trainNo, bookingData.classCode, bookingData.selectedSeats.length, bookingData.passengers.length, bookingData.fromCode, bookingData.toCode, router]);

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



    return (
        <div>
            <div className="w-full">

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
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

                    {/* Selected Seats Display */}
                    {bookingData.selectedSeats.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-green-800 mb-2">Selected Seats</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {bookingData.selectedSeats.map((seat) => (
                                            <span key={seat} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                                Seat {seat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleChangeSeat}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Change Seats
                                </button>
                            </div>
                        </div>
                    )}

                    {!bookingData.trainNo && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800">Please select a train from the search results to proceed with booking.</p>
                        </div>
                    )}

                    {/* Show seat selection button if train is selected but no seats selected */}
                    {bookingData.trainNo && bookingData.classCode && bookingData.selectedSeats.length === 0 && !showSeatSelection && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-blue-800 mb-1">Select Your Seats</h3>
                                    <p className="text-blue-600 text-sm">Choose your preferred seats to continue with booking</p>
                                </div>
                                <button
                                    onClick={() => setShowSeatSelection(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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
                {bookingData.currentStep === "payment" && bookingData.passengers.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h3>

                        <div className="space-y-4">
                            {bookingData.passengers.map((passenger, index) => (
                                <div key={passenger.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium text-gray-700 mb-2">
                                        Passenger {index + 1} - Seat {passenger.seatNumber}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Name:</span>
                                            <p className="font-medium">{passenger.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Age:</span>
                                            <p className="font-medium">{passenger.age}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Gender:</span>
                                            <p className="font-medium">{passenger.gender}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Seat Selection Modal */}
            <SeatSelectionModal
                isOpen={showSeatSelection}
                onClose={handleModalClose}
                onSeatsSelected={handleSeatsSelected}
            />
        </div>
    );
}
