"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import ThirdAC from "./3A";
import FirstAC from "./1A";
import SL from "./SL";
import SecondAC from "./2A";

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
        return <ThirdAC onSeatsSelected={onSeatsSelected} />;
      case "2A":
        return <SecondAC onSeatsSelected={onSeatsSelected} />;
      case "1A":
        return <FirstAC onSeatsSelected={onSeatsSelected} />;
      case "SL":
        return <SL onSeatsSelected={onSeatsSelected} />;
      default:
        return <ThirdAC onSeatsSelected={onSeatsSelected} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Select Seats - {bookingData.classCode} Class</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6">
          {renderClassComponent()}
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
