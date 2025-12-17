"use client";

import { useEffect, useState } from "react";
import { Train, Calendar, Clock, Users, CreditCard, MapPin, Ticket, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Passenger {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  seatNumber: string;
  seatType: "Lower" | "Middle" | "Upper" | "Side Lower" | "Side Upper" | "-";
}

interface Journey {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
}

interface PaymentDetails {
  transactionId: string;
  paymentMode: "UPI" | "Card" | "NetBanking" | "Wallet";
  status: "SUCCESS" | "FAILED" | "PENDING";
}

interface Booking {
  _id: string;
  pnr: string;
  orderId: string;
  trainNumber: string;
  trainName: string;
  dateOfJourney: string;
  userId: string;
  passengers: Passenger[];
  journey: Journey;
  fare: number;
  bookingStatus: "CONFIRMED" | "WAITING" | "CANCELLED";
  paymentDetails: PaymentDetails;
  createdAt: string | Date;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your bookings.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/payment/get-bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch bookings");
        }

        setBookings(data.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Confirmed",
      },
      WAITING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: AlertCircle,
        label: "Waiting",
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.WAITING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      SUCCESS: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Paid",
      },
      FAILED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Failed",
      },
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const toggleBooking = (bookingId: string) => {
    setExpandedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const handleCancelBooking = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking cancel
    
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to cancel bookings.");
        return;
      }

      const res = await fetch("/api/payment/cancel-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Update the booking in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, bookingStatus: "CANCELLED" as const }
            : booking
        )
      );

      // Show success message
      alert("Booking cancelled successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking. Please try again.");
      console.error("Cancel booking error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
          <p className="text-gray-600">You haven't made any bookings yet. Start booking your train tickets now!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your train bookings</p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => {
            const isExpanded = expandedBookings.has(booking._id);
            
            return (
              <div
                key={booking._id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Collapsed Header - Clickable */}
                <div
                  onClick={() => toggleBooking(booking._id)}
                  className="bg-linear-to-r from-blue-50 to-blue-100 px-6 py-4 cursor-pointer hover:from-blue-100 hover:to-blue-150 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <Train className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-lg font-bold text-gray-900 truncate">
                            {booking.trainName || "Train"}
                          </h2>
                          {getStatusBadge(booking.bookingStatus)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">Train No: {booking.trainNumber}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.journey.from} → {booking.journey.to}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.dateOfJourney).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        <Ticket className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-semibold">{booking.pnr}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={(e) => handleCancelBooking(booking._id, e)}
                        disabled={booking.bookingStatus === "CANCELLED"}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Route Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Journey Details</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                            <div>
                              <p className="font-semibold text-gray-900">{booking.journey.from}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{booking.journey.departureTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6"></div>

                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                            <div>
                              <p className="font-semibold text-gray-900">{booking.journey.to}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{booking.journey.arrivalTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(booking.dateOfJourney).toLocaleDateString("en-IN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Payment & Booking Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment & Booking Info</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Fare:</span>
                            <span className="text-lg font-bold text-gray-900">₹{booking.fare}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment Mode:</span>
                            <span className="text-sm font-medium text-gray-900">{booking.paymentDetails.paymentMode}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment Status:</span>
                            {getPaymentStatusBadge(booking.paymentDetails.status)}
                          </div>

                          <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-600">Transaction ID:</span>
                            <span className="text-xs font-mono text-gray-700 text-right max-w-[200px] break-all">
                              {booking.paymentDetails.transactionId}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Booked On:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passengers Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Passengers ({booking.passengers.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {booking.passengers.map((passenger, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{passenger.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {passenger.age} years • {passenger.gender}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Seat:</span>
                                <span className="font-semibold text-gray-900">{passenger.seatNumber}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Berth:</span>
                                <span className="font-semibold text-gray-900">{passenger.seatType}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
