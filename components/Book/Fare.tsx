import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { useBooking } from "@/context/BookingContext";
import { Receipt, CreditCard, AlertCircle } from "lucide-react";

interface FareProps {
  onPay?: () => void;
}

const Fare: React.FC<FareProps> = ({ onPay }) => {
  const { bookingData, canProceedToPayment } = useBooking();
  const router = useRouter();
  const [gatewayFee] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashfree, setCashfree] = useState<any>(null);
  const [sdkLoading, setSdkLoading] = useState(true);

  // helper to map env mode to SDK mode strings
  const normalizeMode = (envMode?: string) => {
    if (!envMode) return "sandbox";
    const m = envMode.toLowerCase();
    if (m === "test" || m === "sandbox") return "sandbox";
    if (m === "prod" || m === "production" || m === "prod") return "production";
    // fallback
    return "sandbox";
  };

  // Initialize Cashfree SDK
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE as string | undefined;
        const sdkMode = normalizeMode(rawMode);
        const cfClientId = process.env.NEXT_PUBLIC_APP_ID;
        if (!cfClientId) {
          console.error("NEXT_PUBLIC_APP_ID is not set. Set this in .env.local and restart.");
          return;
        }
        console.info(`Loading Cashfree SDK (mode=${sdkMode}) with clientId=${cfClientId}`);
        const sdk = await load({ mode: sdkMode, clientId: cfClientId });
        if (mounted) {
          setCashfree(sdk);
          setSdkLoading(false);
          console.info("Cashfree SDK loaded successfully", sdk);
        }
      } catch (e) {
        console.warn("Failed to load Cashfree SDK", e);
        if (mounted) {
          setSdkLoading(false);
          setError("Payment SDK failed to load. Please refresh the page.");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  const createOrderAndCheckout = async () => {
    setError(null);
    if (!bookingData.fare) return setError("Fare not selected.");
    if (!bookingData.passengers?.length) return setError("Add passenger details first.");

    const amount = Math.round(Number(bookingData.fare) * bookingData.passengers.length) + gatewayFee;
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

  const baseFare = useMemo(() => parseInt(bookingData.fare || "0", 10) || 0, [bookingData.fare]);
  const pax = Math.max(1, bookingData.selectedSeats.length || bookingData.passengers.length || 1);
  const subtotal = baseFare * pax;
  const total = subtotal + gatewayFee;

  if (!bookingData.trainNo) {
    return (
      <aside className="bg-white rounded-lg border border-gray-300 shadow-sm sticky top-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-gray-700" />
            <div>
              <div className="font-semibold text-gray-900 text-base">Payment Summary</div>
              <div className="text-xs text-gray-500 mt-0.5">Select a train to see fare details</div>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-500">Pick a train to display fares</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white rounded-lg border border-gray-300 shadow-sm sticky top-4 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-gray-700" />
            <div>
              <div className="font-semibold text-gray-900 text-base">Payment Summary</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {pax} passenger{pax > 1 ? "s" : ""} • {bookingData.classCode} Class
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="p-6 bg-white">
        <div className="space-y-3.5">
          <div className="flex justify-between items-center py-1.5">
            <div className="text-sm text-gray-600">Base Fare (per person)</div>
            <div className="font-medium text-gray-900">₹{baseFare.toLocaleString("en-IN")}</div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 rounded px-3 py-2 border border-gray-200">
            <div className="text-sm text-gray-700">
              <span className="text-gray-600">Passengers</span>
              <span className="ml-2 text-xs text-gray-500">({pax} × ₹{baseFare.toLocaleString("en-IN")})</span>
            </div>
            <div className="font-semibold text-gray-900">₹{subtotal.toLocaleString("en-IN")}</div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <div className="text-sm text-gray-600">Gateway Charges</div>
            <div className="font-medium text-gray-700">₹{gatewayFee.toLocaleString("en-IN")}</div>
          </div>

          <div className="border-t-2 border-gray-300 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <div className="text-base font-semibold text-gray-900">Total Amount</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={createOrderAndCheckout}
            disabled={!bookingData.passengers.length || loading || sdkLoading || !canProceedToPayment()}
            className="w-full mt-5 py-3 rounded-md bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sdkLoading ? (
              <>
                <div className="loader"></div>
                <span>Loading Payment Gateway...</span>
              </>
            ) : loading ? (
              <>
                <div className="loader"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-md">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure Payment • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Fare;
