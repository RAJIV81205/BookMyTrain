import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { useBooking } from "@/context/BookingContext";
import { CreditCard, Shield, ArrowRight } from "lucide-react";

interface FareProps {
  onPay?: () => void;
  onPaymentStatusChange?: (isProcessing: boolean) => void;
  onPaymentComplete?: (success: boolean) => void;
}

const Fare: React.FC<FareProps> = ({ onPay, onPaymentStatusChange, onPaymentComplete }) => {
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
        const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE as
          | string
          | undefined;
        const sdkMode = normalizeMode(rawMode);
        const cfClientId = process.env.NEXT_PUBLIC_APP_ID;
        if (!cfClientId) {
          console.error(
            "NEXT_PUBLIC_APP_ID is not set. Set this in .env.local and restart."
          );
          return;
        }
        console.info(
          `Loading Cashfree SDK (mode=${sdkMode}) with clientId=${cfClientId}`
        );
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

  const getOrderInfo = async (orderId: string) => {
    const resp = await fetch(
      `/api/payment/get-order-details?orderId=${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingData : bookingData }),
      }
    );
    const data = await resp.json().catch(() => ({}));
    console.info("Get-order-info response:", resp.status, data);
    return { status: resp.status, data };
  };

  const createOrderAndCheckout = async () => {
    setError(null);
    if (!bookingData.fare) return setError("Fare not selected.");
    if (!bookingData.passengers?.length)
      return setError("Add passenger details first.");

    const amount =
      Math.round(Number(bookingData.fare) * bookingData.passengers.length) +
      gatewayFee;
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    onPaymentStatusChange?.(true);
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
        onPaymentStatusChange?.(false);
        return;
      }

      // grab the session id
      const paymentSessionId =
        data?.cashfree?.payment_session_id || data?.payment_session_id;
      if (!paymentSessionId || typeof paymentSessionId !== "string") {
        console.error(
          "No valid payment_session_id returned. Full response:",
          data
        );
        setError(
          "Payment session not returned from backend. Check server logs."
        );
        setLoading(false);
        onPaymentStatusChange?.(false);
        return;
      }

      // Sanity-check: session id shouldn't contain unexpected substrings
      if (
        paymentSessionId.includes("paymentpayment") ||
        paymentSessionId.length > 400
      ) {
        console.warn(
          "Payment session id looks odd — verify backend isn't concatenating values:",
          paymentSessionId
        );
      }

      if (!cashfree) {
        console.error("cashfree SDK not ready when trying to checkout");
        setError("Payment SDK not loaded. Try again.");
        setLoading(false);
        onPaymentStatusChange?.(false);
        return;
      }

      // Pass mode explicitly (normalize the env value you used in load())
      const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE as
        | string
        | undefined;
      const sdkMode = (rawMode || "sandbox").toLowerCase();
      const normalizedMode =
        sdkMode === "prod" || sdkMode === "production"
          ? "production"
          : "sandbox";

      const options = {
        paymentSessionId,
        redirectTarget: "_modal", // try "_self" if modal causes issues
        mode: normalizedMode, // <- <--- important fix
      };

      console.info(
        "Opening Cashfree checkout with session:",
        paymentSessionId,
        "mode:",
        normalizedMode
      );
      const result = await cashfree.checkout(options);

      console.info("Cashfree checkout result:", result);

      if (result?.error) {
        setError("Payment cancelled or failed.");
        onPaymentStatusChange?.(false);
        onPaymentComplete?.(false);
      } else {
        // Payment completed, fetch order details
        onPaymentStatusChange?.(true);
        const orderResponse = await getOrderInfo(data.orderId);
        
        // Check if payment was successful (status 201 = success, others = failed)
        if (orderResponse.status === 201) {
          onPaymentComplete?.(true);
        } else {
          onPaymentComplete?.(false);
        }
        onPaymentStatusChange?.(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        "Something went wrong during checkout. Check console for details."
      );
      onPaymentStatusChange?.(false);
      onPaymentComplete?.(false);
    } finally {
      setLoading(false);
    }
  };

  const baseFare = useMemo(
    () => parseInt(bookingData.fare || "0", 10) || 0,
    [bookingData.fare]
  );
  const pax = Math.max(
    1,
    bookingData.selectedSeats.length || bookingData.passengers.length || 1
  );
  const subtotal = baseFare * pax;
  const total = subtotal + gatewayFee;

  if (!bookingData.trainNo) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-8">
        <div className="bg-linear-to-r from-gray-900 to-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Payment Summary
            </h2>
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Select a train to see fare details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-8">
      <div className="bg-linear-to-r from-gray-900 to-gray-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
        </div>
        <p className="text-xs text-gray-300 mt-1">
          {pax} passenger{pax > 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Fare</span>
            <span className="font-medium text-gray-900">₹{baseFare}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Passengers</span>
            <span className="font-medium text-gray-900">
              ₹{baseFare} × {pax}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gateway Charges</span>
            <span className="font-medium text-gray-900">₹{gatewayFee}</span>
          </div>

          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-gray-900">₹{total}</span>
            </div>
          </div>
        </div>

        <button
          onClick={createOrderAndCheckout}
          disabled={!bookingData.passengers.length || loading || sdkLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sdkLoading ? (
            "Loading Payment..."
          ) : loading ? (
            "Processing..."
          ) : (
            <>
              Proceed to Payment
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-xs text-blue-700 mt-1">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fare;
