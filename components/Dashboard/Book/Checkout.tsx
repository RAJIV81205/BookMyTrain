"use client";

import { useBooking } from "@/context/BookingContext";
import { useState, useEffect } from "react";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";



export default function Checkout() {
    const { bookingData, setBookingData } = useBooking();
    const [showSeatSelection, setShowSeatSelection] = useState(false);
    const [showPassengerForm, setShowPassengerForm] = useState(false);
    const [currentStep, setCurrentStep] = useState<"seats" | "passengers" | "complete">("seats");


    // Show seat selection modal when component mounts and train is selected
    useEffect(() => {
        if (bookingData.trainNo && bookingData.classCode && bookingData.selectedSeats.length === 0) {
            setShowSeatSelection(true);
            setCurrentStep("seats");
        } else if (bookingData.selectedSeats.length > 0 && bookingData.passengers.length === 0) {
            setCurrentStep("passengers");
        } else if (bookingData.passengers.length > 0) {
            setCurrentStep("complete");
        }
    }, [bookingData.trainNo, bookingData.classCode, bookingData.selectedSeats.length, bookingData.passengers.length]);

    const handleSeatsSelected = (seats: number[]) => {
        setBookingData({ selectedSeats: seats });
        console.log("seats selected", seats);
        setShowSeatSelection(false);
        setCurrentStep("passengers");
        setShowPassengerForm(true);
    };

    const handlePassengerDetailsComplete = () => {
        setShowPassengerForm(false);
        setCurrentStep("complete");
    };

    const handleChangeSeat = () => {
        setBookingData({ selectedSeats: [], passengers: [] });
        setShowSeatSelection(true);
        setCurrentStep("seats");
    };

    const handleModalClose = () => {
        setShowSeatSelection(false);
        // If no seats are selected and train is selected, keep current step as "seats"
        if (bookingData.trainNo && bookingData.selectedSeats.length === 0) {
            setCurrentStep("seats");
        }
    };



    return (
        <div className="font-poppins">
            <div className="w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Ticket</h1>

                {/* Progress Steps */}
                <div className="mb-6">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center ${currentStep === "seats" ? "text-blue-600" : currentStep === "passengers" || currentStep === "complete" ? "text-green-600" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "seats" ? "bg-blue-100 border-2 border-blue-600" : currentStep === "passengers" || currentStep === "complete" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Select Seats</span>
                        </div>
                        <div className={`w-8 h-0.5 ${currentStep === "passengers" || currentStep === "complete" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`flex items-center ${currentStep === "passengers" ? "text-blue-600" : currentStep === "complete" ? "text-green-600" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "passengers" ? "bg-blue-100 border-2 border-blue-600" : currentStep === "complete" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Passenger Details</span>
                        </div>
                        <div className={`w-8 h-0.5 ${currentStep === "complete" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`flex items-center ${currentStep === "complete" ? "text-green-600" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "complete" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                3
                            </div>
                            <span className="ml-2 font-medium">Complete</span>
                        </div>
                    </div>
                </div>

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
                {currentStep === "complete" && bookingData.passengers.length > 0 && (
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
