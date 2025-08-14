"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { useBooking } from '@/context/BookingContext'

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
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-4 h-fit">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-gray-400">💰</span>
                    Fare Details
                </h3>
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">🚂</div>
                    <p className="text-gray-500 text-sm">Select a train to see fare details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-4 h-fit">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-green-600">💰</span>
                Fare Details
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-medium">₹{basePrice}</span>
                </div>

                {bookingData.selectedSeats && bookingData.selectedSeats.length > 0 && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Selected Seats</span>
                            <span className="font-medium">{bookingData.selectedSeats.length}</span>
                        </div>

                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{totalPrice}</span>
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Booking Fee</span>
                                <span className="font-medium">₹20</span>
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span className="text-gray-800">Total Amount</span>
                                <span className="text-green-600">₹{totalPrice + 20}</span>
                            </div>
                        </div>
                    </>
                )}

                {(!bookingData.selectedSeats || bookingData.selectedSeats.length === 0) && (
                    <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Select seats to see total fare</p>
                    </div>
                )}
            </div>

            {bookingData.selectedSeats && bookingData.selectedSeats.length > 0 && (
                <div className="mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-800 text-sm font-medium">
                                {bookingData.selectedSeats.length} seat{bookingData.selectedSeats.length > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {bookingData.selectedSeats.map((seat) => (
                                <span key={seat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {seat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Fare

