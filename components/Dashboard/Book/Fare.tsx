"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { useBooking } from '@/context/BookingContext'
import { CreditCard, Receipt, Users, ArrowRight, CheckCircle } from 'lucide-react'

const Fare = () => {
    const { bookingData } = useBooking();
    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    useEffect(() => {
        if (bookingData.fare) {
            const price = parseInt(bookingData.fare) || 0;
            setBasePrice(price);

            if (bookingData.selectedSeats && bookingData.selectedSeats.length > 0) {
                setTotalPrice(bookingData.selectedSeats.length * price);
            } else {
                setTotalPrice(price);
            }
        }
    }, [bookingData.fare, bookingData.selectedSeats]);

    // Show placeholder if no booking data
    if (!bookingData.trainNo) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-4 h-fit overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Fare Summary
                    </h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Select a train to see fare details</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-4 h-fit overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Fare Summary
                </h3>
            </div>

            <div className="p-6">
                

                {/* Fare Breakdown */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Base Fare
                        </span>
                        <span className="font-semibold text-gray-800">₹{basePrice}</span>
                    </div>

                    {bookingData.selectedSeats && bookingData.selectedSeats.length > 0 && (
                        <>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Passengers ({bookingData.selectedSeats.length})
                                </span>
                                <span className="font-medium text-gray-700">₹{basePrice} × {bookingData.selectedSeats.length}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-800">₹{totalPrice}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Gateway Charges</span>
                                <span className="font-medium text-gray-700">₹20</span>
                            </div>

                            

                            <div className="border-t-2 border-gray-300 pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                                    <span className="text-xl font-bold text-green-600">₹{totalPrice + 20}</span>
                                </div>
                            </div>

                            

                            {/* Payment Button */}
                            <button className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                <CreditCard className="w-5 h-5" />
                                Proceed to Payment
                            </button>
                        </>
                    )}

                    {(!bookingData.selectedSeats || bookingData.selectedSeats.length === 0) && (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-gray-500 text-sm mb-2">Select seats to see total fare</p>
                            <div className="w-full bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
                                Select Seats First
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Fare

