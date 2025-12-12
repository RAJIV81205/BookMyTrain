import React, { useMemo, useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { Receipt, CreditCard } from "lucide-react";

const Fare: React.FC<{ onPay?: () => void }> = ({ onPay }) => {
  const { bookingData } = useBooking();
  const [gatewayFee] = useState(20);

  const baseFare = useMemo(() => parseInt(bookingData.fare || "0", 10) || 0, [bookingData.fare]);
  const pax = Math.max(1, bookingData.selectedSeats.length || bookingData.passengers.length || 1);
  const subtotal = baseFare * pax;
  const total = subtotal + gatewayFee;

  if (!bookingData.trainNo) {
    return (
      <aside className="bg-white rounded-xl border p-4 shadow">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded">
          <Receipt className="w-5 h-5" />
          <div>
            <div className="font-semibold">Fare Summary</div>
            <div className="text-xs opacity-90">Select a train to see fare details</div>
          </div>
        </div>

        <div className="p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 text-slate-400" />
          </div>
          <div className="text-sm text-slate-500">Pick a train to display fares</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white rounded-xl border p-4 shadow sticky top-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-gradient-to-r from-indigo-600 to-sky-600 text-white">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Fare Summary</div>
            <div className="text-xs text-gray-500">{pax} passenger{pax > 1 ? "s" : ""}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between">
          <div className="text-sm text-gray-600">Base Fare</div>
          <div className="font-medium">₹{baseFare}</div>
        </div>

        <div className="flex justify-between">
          <div className="text-sm text-gray-600">Passengers</div>
          <div className="font-medium">₹{baseFare} × {pax}</div>
        </div>

        <div className="flex justify-between">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="font-semibold">₹{subtotal}</div>
        </div>

        <div className="flex justify-between">
          <div className="text-sm text-gray-600">Gateway Charges</div>
          <div className="font-medium">₹{gatewayFee}</div>
        </div>

        <div className="border-t mt-3 pt-3 flex justify-between items-center">
          <div className="text-lg font-bold">Total</div>
          <div className="text-xl font-extrabold text-emerald-600">₹{total}</div>
        </div>

        <button onClick={onPay} disabled={!bookingData.passengers.length} className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold disabled:opacity-50">
          <CreditCard className="w-4 h-4 inline-block mr-2" /> Pay Now
        </button>
      </div>
    </aside>
  );
};

export default Fare;