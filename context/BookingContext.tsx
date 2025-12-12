"use client";
import React, { createContext, useContext, useState } from "react";

export type Gender = "Male" | "Female" | "Other";

export interface PassengerDetails {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  seatNumber: number;
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
  validateBooking: () => { isValid: boolean; errors: string[] };
  canProceedToPayment: () => boolean;
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

  const validateBooking = () => {
    const errors: string[] = [];
    
    if (!bookingData.trainNo) errors.push("Train number is required");
    if (!bookingData.fromCode || !bookingData.toCode) errors.push("Source and destination stations are required");
    if (!bookingData.date) errors.push("Travel date is required");
    if (!bookingData.classCode) errors.push("Class selection is required");
    if (bookingData.selectedSeats.length === 0) errors.push("Please select at least one seat");
    if (bookingData.passengers.length !== bookingData.selectedSeats.length) {
      errors.push("Passenger details must match the number of selected seats");
    }
    
    bookingData.passengers.forEach((p, idx) => {
      if (!p.name || p.name.trim().length < 2) errors.push(`Passenger ${idx + 1}: Name must be at least 2 characters`);
      if (!p.age || p.age < 1 || p.age > 120) errors.push(`Passenger ${idx + 1}: Age must be between 1 and 120`);
      if (!p.gender) errors.push(`Passenger ${idx + 1}: Gender is required`);
    });

    return { isValid: errors.length === 0, errors };
  };

  const canProceedToPayment = () => {
    return (
      bookingData.trainNo &&
      bookingData.fromCode &&
      bookingData.toCode &&
      bookingData.date &&
      bookingData.classCode &&
      bookingData.selectedSeats.length > 0 &&
      bookingData.passengers.length === bookingData.selectedSeats.length &&
      bookingData.passengers.every(p => p.name && p.name.trim().length >= 2 && p.age > 0 && p.age <= 120 && p.gender)
    );
  };

  return (
    <BookingContext.Provider value={{ 
      bookingData, 
      setBookingData, 
      addPassenger, 
      updatePassenger, 
      removePassenger, 
      resetBooking,
      validateBooking,
      canProceedToPayment
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
