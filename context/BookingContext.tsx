"use client";

import React, { createContext, useContext, useState } from "react";

export type Gender = "Male" | "Female" | "Other";
export type BerthType = "LB" | "MB" | "UB" | "SL" | "SU";

export interface PassengerDetails {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  seatNumber: number;
  seatType: BerthType;
  berthType?: BerthType; // Alias for compatibility
}

export interface BookingData {
  fromCode: string;
  toCode: string;
  fromStnName: string;
  toStnName: string;
  date: string;
  trainNo: string;
  trainName: string;
  classCode: string;
  fare: string;
  fromTime: string;
  toTime: string;
  selectedSeats: number[];
  passengers: PassengerDetails[];
  currentStep: "seats" | "passengers" | "payment";
}

export interface BookingContextType {
  bookingData: BookingData;
  setBookingData: (data: Partial<BookingData>) => void;
  addPassenger: (p: PassengerDetails) => void;
  updatePassenger: (id: string, updates: Partial<PassengerDetails>) => void;
  removePassenger: (id: string) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingData, setBookingDataState] = useState<BookingData>({
    fromCode: "",
    toCode: "",
    fromStnName: "",
    toStnName: "",
    date: "",
    trainNo: "",
    trainName: "",
    classCode: "",
    fare: "",
    fromTime: "",
    toTime: "",
    selectedSeats: [],
    passengers: [],
    currentStep: "seats",
  });

  const setBookingData = (data: Partial<BookingData>) => setBookingDataState((prev) => ({ ...prev, ...data }));

  const addPassenger = (p: PassengerDetails) => {
    setBookingDataState((prev) => ({ ...prev, passengers: [...prev.passengers, p] }));
  };

  const updatePassenger = (id: string, updates: Partial<PassengerDetails>) => {
    setBookingDataState((prev) => ({ ...prev, passengers: prev.passengers.map((x) => (x.id === id ? { ...x, ...updates } : x)) }));
  };

  const removePassenger = (id: string) => {
    setBookingDataState((prev) => ({ ...prev, passengers: prev.passengers.filter((p) => p.id !== id) }));
  };

  const resetBooking = () => {
    setBookingDataState({
      fromCode: "",
      toCode: "",
      fromStnName: "",
      toStnName: "",
      date: "",
      trainNo: "",
      trainName: "",
      classCode: "",
      fare: "",
      fromTime: "",
      toTime: "",
      selectedSeats: [],
      passengers: [],
      currentStep: "seats",
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, addPassenger, updatePassenger, removePassenger, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
