import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { useBooking } from "@/context/BookingContext";
import { Receipt, CreditCard } from "lucide-react";

interface FareProps {
  onPay?: () => void;
}

const Fare: React.FC<FareProps> = ({ onPay }) => {
  const { bookingData } = useBooking();
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

        <button 
          onClick={createOrderAndCheckout} 
          disabled={!bookingData.passengers.length || loading || sdkLoading} 
          className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4 inline-block mr-2" /> 
          {sdkLoading ? "Loading Payment..." : loading ? "Processing..." : "Pay Now"}
        </button>
        
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </aside>
  );
};

export default Fare;