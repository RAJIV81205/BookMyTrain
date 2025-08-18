"use client";

import { useBooking } from "@/context/BookingContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import { Train, Clock, MapPin, Users, Calendar, CreditCard } from "lucide-react";




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


    console.table(bookingData)


    return (
        <div>
            <div className="w-full">

                <div className="bg-white rounded-xl border border-gray-200 shadow-lg mb-8">
                    <div className="border-b border-gray-100 px-8 py-6">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Journey Details</h2>
                        <p className="text-sm text-gray-500 mt-1">Review your booking information</p>
                    </div>

                    {/* Journey Route Card */}
                    <div className="p-8">
                        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-slate-200 shadow-inner">
                            <div className="flex items-start justify-between relative min-h-[120px]">
                                {/* Source Station */}
                                <div className="flex-1 max-w-[35%]">
                                    <div className="flex items-center mb-4">
                                        <div className="w-4 h-4 bg-blue-600 rounded-full mr-3 shadow-sm"></div>
                                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Departure</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                                                {bookingData.fromCode || "---"}
                                            </h3>
                                            {bookingData.fromStnName && (
                                                <p className="text-sm text-gray-600 font-medium leading-tight">
                                                    {bookingData.fromStnName}
                                                </p>
                                            )}
                                        </div>
                                        {bookingData.fromTime && (
                                            <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span className="text-sm font-bold tracking-wide">{bookingData.fromTime}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Connecting Line with Train Icon */}
                                <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
                                    <div className="relative w-full flex items-center">
                                        <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-green-600 rounded-full shadow-sm"></div>
                                        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border-3 border-gray-300 rounded-full p-3 shadow-lg">
                                            <Train className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>
                                    {bookingData.trainName && (
                                        <div className="mt-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                            <span className="text-sm text-gray-700 font-semibold">{bookingData.trainName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Destination Station */}
                                <div className="flex-1 max-w-[35%] text-right">
                                    <div className="flex items-center justify-end mb-4">
                                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider mr-3">Arrival</span>
                                        <div className="w-4 h-4 bg-green-600 rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                                                {bookingData.toCode || "---"}
                                            </h3>
                                            {bookingData.toStnName && (
                                                <p className="text-sm text-gray-600 font-medium leading-tight">
                                                    {bookingData.toStnName}
                                                </p>
                                            )}
                                        </div>
                                        {bookingData.toTime && (
                                            <div className="flex justify-end">
                                                <div className="inline-flex items-center bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-sm">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span className="text-sm font-bold tracking-wide">{bookingData.toTime}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="border-t border-gray-100 px-8 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                </div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Travel Date</label>
                                <p className="text-base font-bold text-gray-900">{new Date(bookingData.date).toLocaleDateString("en-IN" , {day:"2-digit" , month :"2-digit" ,year:"numeric"}) || "Not selected"}</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Train className="w-5 h-5 text-gray-600" />
                                </div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Train Number</label>
                                <p className="text-base font-bold text-gray-900">{bookingData.trainNo || "Not selected"}</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                </div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                                <p className="text-base font-bold text-gray-900">{bookingData.classCode || "Not selected"}</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                </div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fare</label>
                                <p className="text-base font-bold text-gray-900">{bookingData.fare ? `₹${bookingData.fare}` : "Not selected"}</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-5 h-5 text-gray-600" />
                                </div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Passengers</label>
                                <p className="text-base font-bold text-gray-900">{bookingData.passengers.length || bookingData.selectedSeats.length || "0"}</p>
                            </div>


                        </div>
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



            {/* Seat Selection Modal */}
            <SeatSelectionModal
                isOpen={showSeatSelection}
                onClose={handleModalClose}
                onSeatsSelected={handleSeatsSelected}
            />
        </div>

    );
}
