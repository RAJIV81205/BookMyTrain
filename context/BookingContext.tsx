// context/BookingContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

interface PassengerDetails {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  seatNumber: number;
}

interface BookingData {
  fromCode: string;
  toCode: string;
  date: string;
  trainNo: string;
  classCode: string;
  fare: string;
  selectedSeats: number[];
  passengers: PassengerDetails[];
}

interface BookingContextType {
  bookingData: BookingData;
  setBookingData: (data: Partial<BookingData>) => void;
  addPassenger: (passenger: PassengerDetails) => void;
  updatePassenger: (id: string, updates: Partial<PassengerDetails>) => void;
  removePassenger: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingData, setBookingDataState] = useState<BookingData>({
    fromCode: "",
    toCode: "",
    date: "",
    trainNo: "",
    classCode: "",
    fare: "",
    selectedSeats: [],
    passengers: [],
  });

  const setBookingData = (data: Partial<BookingData>) => {
    setBookingDataState((prev) => ({ ...prev, ...data }));
  };

  const addPassenger = (passenger: PassengerDetails) => {
    setBookingDataState((prev) => ({
      ...prev,
      passengers: [...prev.passengers, passenger],
    }));
  };

  const updatePassenger = (id: string, updates: Partial<PassengerDetails>) => {
    setBookingDataState((prev) => ({
      ...prev,
      passengers: prev.passengers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const removePassenger = (id: string) => {
    setBookingDataState((prev) => ({
      ...prev,
      passengers: prev.passengers.filter((p) => p.id !== id),
    }));
  };

  return (
    <BookingContext.Provider value={{
      bookingData,
      setBookingData,
      addPassenger,
      updatePassenger,
      removePassenger
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};
