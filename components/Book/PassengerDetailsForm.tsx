"use client";

import React, { useState } from "react";
import { useBooking } from "@/context/BookingContext";

interface PassengerDetailsFormProps {
  selectedSeats: number[];
  onComplete: () => void;
}

const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
  selectedSeats,
  onComplete,
}) => {
  const { addPassenger } = useBooking();
  const [passengers, setPassengers] = useState(
    selectedSeats.map((seatNumber) => ({
      id: `passenger-${seatNumber}`,
      name: "",
      age: "",
      gender: "Male" as const,
      seatNumber,
    }))
  );

  const handleInputChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const isValid = passengers.every(
      (p) => p.name.trim() && p.age && Number(p.age) > 0
    );

    if (!isValid) {
      alert("Please fill all passenger details");
      return;
    }

    // Add passengers to context
    passengers.forEach((passenger) => {
      addPassenger({
        ...passenger,
        age: Number(passenger.age),
      });
    });

    onComplete();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Passenger Details
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {passengers.map((passenger, index) => (
          <div
            key={passenger.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <h4 className="font-medium text-gray-700 mb-3">
              Passenger {index + 1} - Seat {passenger.seatNumber}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={passenger.age}
                  onChange={(e) =>
                    handleInputChange(index, "age", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                  min="1"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gender *
                </label>
                <select
                  value={passenger.gender}
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "gender",
                      e.target.value as "Male" | "Female" | "Other"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Save Passenger Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerDetailsForm;