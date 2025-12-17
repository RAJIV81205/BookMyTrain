import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";
import Booking from "@/lib/db/model/Booking";
import connectDB from "@/lib/db/db";

/**
 * Generate a unique refund ID that meets Cashfree requirements
 * Requirements: alphanumeric, 3-40 characters
 */
function generateRefundId(pnr: string): string {
    // Remove any non-alphanumeric characters from PNR and timestamp
    const cleanPnr = pnr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    
    // Ensure total length is between 3-40 characters
    const refundId = `REF${cleanPnr}${timestamp}${random}`.slice(0, 40);
    
    if (refundId.length < 3) {
        return `REF${timestamp}${random}`.slice(0, 40);
    }
    
    return refundId;
}

/**
 * Handle refund using Cashfree Payment Gateway API
 * API Documentation: https://www.cashfree.com/docs/api/payments/v2025-01-01#tag/Refunds/operation/PGOrderCreateRefund
 */
async function handleRefund(orderId: string, booking: any) {
    try {
        // Validate orderId
        if (!orderId || typeof orderId !== "string") {
            throw new Error("Order ID is required for refund processing");
        }

        // Generate refund ID (alphanumeric, 3-40 chars as per API spec)
        const refundId = generateRefundId(booking.pnr);

        // Determine Cashfree API endpoint based on environment
        const isProduction = process.env.NEXT_PUBLIC_CASHFREE_MODE?.toLowerCase() === "production";
        const baseUrl = isProduction
            ? "https://api.cashfree.com/pg"
            : "https://sandbox.cashfree.com/pg";

        const refundUrl = `${baseUrl}/orders/${orderId}/refunds`;

        // Calculate refund amount (full fare minus gateway charges if applicable)
        const refundAmount = booking.fare - 20; // Subtracting gateway fee
        
        // Validate refund amount
        if (refundAmount <= 0) {
            throw new Error("Refund amount must be greater than 0");
        }

        // Prepare refund note (3-100 characters as per API spec)
        const refundNote = `Order cancelled by customer - PNR: ${booking.pnr}`.slice(0, 100);
        if (refundNote.length < 3) {
            throw new Error("Refund note must be at least 3 characters");
        }

        // Prepare request body according to OrderCreateRefundRequest schema
        const requestBody = {
            refund_id: refundId,
            refund_amount: refundAmount,
            refund_note: refundNote,
            refund_speed: "STANDARD" as const, // STANDARD or INSTANT
        };

        // Prepare headers according to API specification
        const headers: Record<string, string> = {
            "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
            "x-client-id": process.env.NEXT_PUBLIC_APP_ID as string,
            "x-client-secret": process.env.SECRET_KEY as string,
            "Content-Type": "application/json",
        };

        // Add idempotency key (optional but recommended)
        headers["x-idempotency-key"] = refundId;

        // Make API call
        const response = await fetch(refundUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        // Handle different response status codes according to API spec
        if (!response.ok) {
            const errorMessage = result.message || result.error || "Refund request failed";
            const errorCode = result.code || "unknown_error";
            const errorType = result.type || "api_error";

            console.error("Refund API error:", {
                status: response.status,
                code: errorCode,
                type: errorType,
                message: errorMessage,
                help: result.help,
            });

            // Provide more specific error messages based on status code
            switch (response.status) {
                case 400:
                    throw new Error(`Bad Request: ${errorMessage}`);
                case 401:
                    throw new Error(`Authentication Failed: ${errorMessage}`);
                case 404:
                    throw new Error(`Order not found: ${errorMessage}`);
                case 409:
                    throw new Error(`Duplicate request: ${errorMessage}`);
                case 422:
                    throw new Error(`Idempotency error: ${errorMessage}`);
                case 429:
                    throw new Error(`Rate limit exceeded: ${errorMessage}`);
                case 500:
                    throw new Error(`Cashfree server error: ${errorMessage}`);
                case 502:
                    throw new Error(`Bank processing failure: ${errorMessage}`);
                default:
                    throw new Error(`Refund failed (${response.status}): ${errorMessage}`);
            }
        }

        // Return successful refund response (RefundEntity)
        return {
            success: true,
            refund: result,
            refundId: result.refund_id,
            cfRefundId: result.cf_refund_id,
            refundStatus: result.refund_status,
            refundAmount: result.refund_amount,
        };
    } catch (error: any) {
        console.error("Error handling refund:", error);
        throw new Error(error.message || "Failed to process refund");
    }
}


export async function POST(request: Request) {
    try {
        /* ---------------- Authorization Header Validation ---------------- */
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, error: "Authorization token missing or invalid" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Token not provided" },
                { status: 401 }
            );
        }

        /* ---------------- Token Verification ---------------- */
        const user = await verifyToken(token);

        if (!user || !user._id) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        /* ---------------- Request Body Validation ---------------- */
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json(
                { success: false, error: "Booking ID is required" },
                { status: 400 }
            );
        }

        /* ---------------- Database Connection ---------------- */
        await connectDB();

        /* ---------------- Fetch Booking ---------------- */
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found" },
                { status: 404 }
            );
        }

        /* ---------------- Verify User Ownership ---------------- */
        // Convert both to strings for comparison (userId is string, user._id might be ObjectId)
        const bookingUserId = booking.userId.toString();
        const requestUserId = user._id.toString();

        if (bookingUserId !== requestUserId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: This booking does not belong to you" },
                { status: 403 }
            );
        }

        /* ---------------- Check Booking Status ---------------- */
        if (booking.bookingStatus === "CANCELLED") {
            return NextResponse.json(
                { success: false, error: "Booking is already cancelled" },
                { status: 400 }
            );
        }

        /* ---------------- Check Payment Status ---------------- */
        if (booking.paymentDetails.status !== "SUCCESS") {
            return NextResponse.json(
                { success: false, error: "Cannot cancel booking with unsuccessful payment" },
                { status: 400 }
            );
        }

        /* ---------------- Process Refund ---------------- */
        let refundResult = null;
        let refundError = null;
        
        if (booking.orderId) {
            try {
                refundResult = await handleRefund(booking.orderId, booking);
            } catch (refundErr: any) {
                refundError = refundErr.message || "Refund processing failed";
                console.error("Refund processing failed:", refundErr);
                // Continue with cancellation even if refund fails
                // Refund can be processed manually later if needed
            }
        } else {
            refundError = "Order ID not found in booking. Refund cannot be processed automatically.";
            console.warn("Order ID missing from booking:", booking._id);
        }

        /* ---------------- Cancel Booking ---------------- */
        booking.bookingStatus = "CANCELLED";
        await booking.save();

        return NextResponse.json(
            {
                success: true,
                message: refundResult
                    ? "Booking cancelled and refund processed successfully"
                    : refundError
                    ? `Booking cancelled successfully. ${refundError}`
                    : "Booking cancelled successfully",
                booking: {
                    _id: booking._id,
                    pnr: booking.pnr,
                    bookingStatus: booking.bookingStatus,
                },
                refund: refundResult
                    ? {
                          refundId: refundResult.refundId,
                          cfRefundId: refundResult.cfRefundId,
                          status: refundResult.refundStatus,
                          amount: refundResult.refundAmount,
                          details: refundResult.refund,
                      }
                    : null,
                refundError: refundError || null,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Cancel booking error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
