"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import ThirdAC from "./classes/3A";
import FirstAC from "./classes/1A";
import SL from "./classes/SL";
import SecondAC from "./classes/2A";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeatsSelected: (seats: number[]) => void;
}

const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  isOpen,
  onClose,
  onSeatsSelected,
}) => {
  const { bookingData } = useBooking();

  if (!isOpen) return null;

  const renderClassComponent = () => {
    switch (bookingData.classCode) {
      case "3A":
        return <ThirdAC onSeatsSelected={onSeatsSelected} onClose={onClose} />;
      case "2A":
        return <SecondAC onSeatsSelected={onSeatsSelected} onClose={onClose} />;
      case "1A":
        return <FirstAC onSeatsSelected={onSeatsSelected} onClose={onClose} />;
      case "SL":
        return <SL onSeatsSelected={onSeatsSelected} onClose={onClose} />;
      default:
        return <ThirdAC onSeatsSelected={onSeatsSelected} onClose={onClose} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Select Seats - {bookingData.classCode} Class
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          {renderClassComponent()}
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;