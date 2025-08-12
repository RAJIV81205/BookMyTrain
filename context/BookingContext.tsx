// context/BookingContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

interface BookingData {
  fromCode: string;
  toCode: string;
  date: string;
  trainNo: string;
  classCode: string;
  fare: string;
}

interface BookingContextType {
  bookingData: BookingData;
  setBookingData: (data: Partial<BookingData>) => void;
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
  });

  const setBookingData = (data: Partial<BookingData>) => {
    setBookingDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};
