"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import SeatSelectionModal from "./classes/SeatSelectionModal";
import PassengerDetailsForm from "./PassengerDetailsForm";
import { useBooking } from "@/context/BookingContext";
import { Train, Clock } from "lucide-react";

export default function Checkout() {
  const { bookingData, setBookingData, removePassenger } = useBooking();
  const router = useRouter();
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashfree, setCashfree] = useState<any>(null);

  // helper to map env mode to SDK mode strings
  const normalizeMode = (envMode?: string) => {
    if (!envMode) return "sandbox";
    const m = envMode.toLowerCase();
    if (m === "test" || m === "sandbox") return "sandbox";
    if (m === "prod" || m === "production" || m === "prod") return "production";
    // fallback
    return "sandbox";
  };

  // Initialize Cashfree once (client SDK)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE as string | undefined;
        const sdkMode = normalizeMode(rawMode);
        const cfClientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
        if (!cfClientId) {
          console.error("NEXT_PUBLIC_CASHFREE_CLIENT_ID is not set. Set this in .env.local and restart.");
          return;
        }
        console.info(`Loading Cashfree SDK (mode=${sdkMode}) with clientId=${cfClientId}`);
        const sdk = await load({ mode: sdkMode, clientId: cfClientId });
        if (mounted) {
          setCashfree(sdk);
          console.info("Cashfree SDK loaded", sdk);
        }
      } catch (e) {
        console.warn("Failed to load Cashfree SDK", e);
        // surfacing to user but keep message friendly:
        setError("Payment SDK failed to load. Check console for details.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData.trainNo || !bookingData.fromCode || !bookingData.toCode) {
      router.push("/dashboard");
      return;
    }

    if (bookingData.trainNo && bookingData.classCode && bookingData.selectedSeats.length === 0) {
      setShowSeatSelection(true);
      setBookingData({ currentStep: "seats" });
    } else if (bookingData.selectedSeats.length > 0 && bookingData.passengers.length === 0) {
      setShowPassengerForm(true);
      setBookingData({ currentStep: "passengers" });
    } else if (bookingData.passengers.length > 0) {
      setBookingData({ currentStep: "payment" });
    }
  }, [bookingData.trainNo, bookingData.classCode, bookingData.selectedSeats.length, bookingData.passengers.length]);

  const token = useMemo(() => {
    try {
      if (typeof window === "undefined") return null;
      const ls = localStorage.getItem("token");
      if (ls) return ls;
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const handleSeatsSelected = (seats: number[]) => {
    setBookingData({ selectedSeats: seats, currentStep: "passengers" });
    setShowSeatSelection(false);
    setShowPassengerForm(true);
  };

  const handlePassengerDetailsComplete = () => {
    setShowPassengerForm(false);
    setBookingData({ currentStep: "payment" });
  };

  const handleChangeSeat = () => {
    bookingData.passengers.forEach((p) => removePassenger(p.id));
    setBookingData({ selectedSeats: [], passengers: [], currentStep: "seats" });
    setShowSeatSelection(true);
  };

  // inside your Checkout component (replace createOrderAndCheckout function)
const createOrderAndCheckout = async () => {
  setError(null);
  if (!bookingData.fare) return setError("Fare not selected.");
  if (!bookingData.passengers?.length) return setError("Add passenger details first.");

  const amount = Math.round(Number(bookingData.fare) * bookingData.passengers.length);
  if (!token) {
    router.push("/login");
    return;
  }

  setLoading(true);
  try {
    console.info("Creating order, amount:", amount);
    const resp = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, token }),
    });

    const data = await resp.json().catch(() => ({}));
    console.info("Create-order response:", resp.status, data);

    if (!resp.ok) {
      setError(data?.error || "Order creation failed on server.");
      setLoading(false);
      return;
    }

    // grab the session id
    const paymentSessionId = data?.cashfree?.payment_session_id || data?.payment_session_id;
    if (!paymentSessionId || typeof paymentSessionId !== "string") {
      console.error("No valid payment_session_id returned. Full response:", data);
      setError("Payment session not returned from backend. Check server logs.");
      setLoading(false);
      return;
    }

    // Sanity-check: session id shouldn't contain unexpected substrings
    if (paymentSessionId.includes("paymentpayment") || paymentSessionId.length > 400) {
      console.warn("Payment session id looks odd — verify backend isn't concatenating values:", paymentSessionId);
    }

    if (!cashfree) {
      console.error("cashfree SDK not ready when trying to checkout");
      setError("Payment SDK not loaded. Try again.");
      setLoading(false);
      return;
    }

    // Pass mode explicitly (normalize the env value you used in load())
    const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE as string | undefined;
    const sdkMode = (rawMode || "sandbox").toLowerCase();
    const normalizedMode = sdkMode === "prod" || sdkMode === "production" ? "production" : "sandbox";

    const options = {
      paymentSessionId,
      redirectTarget: "_modal", // try "_self" if modal causes issues
      mode: normalizedMode,     // <- <--- important fix
    };

    console.info("Opening Cashfree checkout with session:", paymentSessionId, "mode:", normalizedMode);
    const result = await cashfree.checkout(options);

    console.info("Cashfree checkout result:", result);

    if (result?.error) {
      setError("Payment cancelled or failed.");
    } else if (result?.paymentDetails || result?.status === "SUCCESS") {
      router.push("/bookings");
    } else {
      console.warn("Unexpected checkout result:", result);
      router.push("/bookings");
    }
  } catch (err) {
    console.error("Checkout error:", err);
    setError("Something went wrong during checkout. Check console for details.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Journey Details</h2>
          <p className="text-sm text-gray-500">Confirm the details below before proceeding</p>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-sky-600" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Departure</div>
                      <div className="font-semibold text-lg">{bookingData.fromCode || "---"}</div>
                      <div className="text-sm text-gray-600">{bookingData.fromStnName}</div>
                      {bookingData.fromTime && (
                        <div className="inline-flex items-center mt-2 text-xs bg-white border rounded px-2 py-1">
                          <Clock className="w-4 h-4 mr-1" /> {bookingData.fromTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-white">
                    <Train className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{bookingData.trainName}</div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-xs text-gray-500 uppercase">Arrival</div>
                  <div className="font-semibold text-lg">{bookingData.toCode || "---"}</div>
                  <div className="text-sm text-gray-600">{bookingData.toStnName}</div>
                  {bookingData.toTime && (
                    <div className="inline-flex items-center mt-2 text-xs bg-white border rounded px-2 py-1">
                      <Clock className="w-4 h-4 mr-1" /> {bookingData.toTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Travel Date</div>
                  <div className="font-medium">{bookingData.date ? new Date(bookingData.date).toLocaleDateString("en-IN") : "Not set"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Train No</div>
                  <div className="font-medium">{bookingData.trainNo || "---"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Class</div>
                  <div className="font-medium">{bookingData.classCode || "---"}</div>
                </div>

                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xs text-gray-500">Passengers</div>
                  <div className="font-medium">{Math.max(bookingData.passengers.length, bookingData.selectedSeats.length)}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white p-4 rounded border shadow-sm">
                <div className="text-sm text-gray-500">Fare</div>
                <div className="mt-2 text-xl font-bold">{bookingData.fare ? `₹${bookingData.fare}` : "-"}</div>

                <div className="mt-6">
                  {bookingData.selectedSeats.length === 0 ? (
                    <button onClick={() => setShowSeatSelection(true)} className="w-full bg-sky-600 text-white py-2 rounded-lg">Select Seats</button>
                  ) : bookingData.passengers.length === 0 ? (
                    <button onClick={() => setShowPassengerForm(true)} className="w-full bg-sky-600 text-white py-2 rounded-lg">Add Passengers</button>
                  ) : (
                    <button disabled={loading} onClick={createOrderAndCheckout} className="w-full py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold">{loading ? "Processing..." : "Proceed to Payment"}</button>
                  )}
                </div>

                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
              </div>

              <div className="mt-4 text-xs text-gray-500">Secure payments · 99.9% uptime</div>
            </div>
          </div>
        </div>
      </section>

      {bookingData.selectedSeats.length > 0 && (
        <section className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Selected Seats</h3>
            <button className="text-sm underline" onClick={handleChangeSeat}>Change</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {bookingData.selectedSeats.map((s) => (
              <span key={s} className="px-3 py-1 bg-slate-100 border rounded">Seat {s}</span>
            ))}
          </div>
        </section>
      )}

      {showPassengerForm && bookingData.selectedSeats.length > 0 && (
        <PassengerDetailsForm selectedSeats={bookingData.selectedSeats} onComplete={handlePassengerDetailsComplete} />
      )}

      <SeatSelectionModal isOpen={showSeatSelection} onClose={() => setShowSeatSelection(false)} onSeatsSelected={handleSeatsSelected} />
    </div>
  );
}
