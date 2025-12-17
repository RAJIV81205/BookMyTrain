// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import verifyToken from "@/lib/db/middleware/verifyToken";
import Booking from "@/lib/db/model/Booking";
import connectDB from "@/lib/db/db";

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.NEXT_PUBLIC_APP_ID as string,
  process.env.SECRET_KEY as string
);

/** Map frontend berth codes to schema strings */
function mapSeatType(berth: string):
  "Lower" | "Middle" | "Upper" | "Side Lower" | "Side Upper" | "-" {
  switch (berth) {
    case "LB": return "Lower";
    case "MB": return "Middle";
    case "UB": return "Upper";
    case "SL": return "Side Lower";
    case "SU": return "Side Upper";
    default:
      return "-";
  }
}

function mapPaymentMode(group?: string, methodObj?: any): "UPI" | "Card" | "NetBanking" | "Wallet" {
  const g = (group ?? "").toString().toUpperCase();
  if (g.includes("UPI")) return "UPI";
  if (g.includes("CARD") || (methodObj?.type && methodObj.type.toString().toLowerCase().includes("card"))) return "Card";
  if (g.includes("NET") || g.includes("NETBANKING")) return "NetBanking";
  return "UPI";
}

function generatePNR(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PNR${t}${r}`;
}

/** Build booking document but DO NOT parse or convert date/time strings */
async function buildBookingDocument(
  orderId: string,
  bookingdata: any,
  orderObj: any,
  user: any
) {
  // Use incoming strings directly (no parsing)
  const dateOfJourneyStr = bookingdata.date ?? "";        // e.g. "2025-12-13"
  const departureTimeStr = bookingdata.fromTime ?? "";    // e.g. "01:26"
  const arrivalTimeStr = bookingdata.toTime ?? "";       // e.g. "08:45"

  const passengers = (bookingdata.passengers ?? bookingdata.passenger ?? []).map((p: any, idx: number) => {
    const incomingSeat = p.seatNumber ?? (bookingdata.selectedSeats ? bookingdata.selectedSeats[idx] : null);
    const seatStr = incomingSeat !== null && incomingSeat !== undefined ? String(incomingSeat) : String(idx + 1);

    const seatType = mapSeatType(p.seatType);

    let gender = (p.gender ?? "Other").toString();
    gender = ["male", "m"].includes(gender.toLowerCase()) ? "Male" : ["female", "f"].includes(gender.toLowerCase()) ? "Female" : "Other";

    return {
      name: p.name ?? `Passenger ${idx + 1}`,
      age: Number(p.age ?? 0),
      gender,
      seatNumber: seatStr, // string as required by your schema
      seatType,
    };
  });

  const fare = Number(orderObj?.order_amount ?? bookingdata.fare ?? 0);

  const paymentDetails = {
    transactionId: orderObj?.cf_payment_id ?? orderObj?.bank_reference ?? orderId,
    paymentMode: mapPaymentMode(orderObj?.payment_group ?? orderObj?.payment_method?.type, orderObj?.payment_method),
    status: (orderObj?.payment_status ?? "PENDING").toString().toUpperCase()
  };

  const journey = {
    from: bookingdata.fromStnName ?? bookingdata.from ?? bookingdata.fromCode ?? "Unknown",
    to: bookingdata.toStnName ?? bookingdata.to ?? bookingdata.toCode ?? "Unknown",
    departureTime: departureTimeStr, // store raw string
    arrivalTime: arrivalTimeStr      // store raw string
  };

  const doc: any = {
    pnr: "", // to be filled after uniqueness check
    trainNumber: bookingdata.trainNo ?? bookingdata.trainNumber ?? "UNKNOWN",
    trainName: bookingdata.trainName ?? bookingdata.train ?? "UNKNOWN",
    dateOfJourney: dateOfJourneyStr, // store as string (no Date conversion)
    userId: user._id,
    passengers,
    journey,
    fare,
    bookingStatus: "CONFIRMED" as "CONFIRMED",
    paymentDetails,
    createdAt: new Date() // keep timestamp; change to string if you want
  };

  return doc;
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const bookingdata = body.bookingData ?? body.booking ?? null;
    const orderId = searchParams.get("orderId");
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required in query param `orderId`" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const orderDetails = await cashfree.PGOrderFetchPayments(orderId);

    if (!orderDetails || !orderDetails.data || !Array.isArray(orderDetails.data) || !orderDetails.data[0]) {
      return NextResponse.json({ error: "Invalid order details returned from Cashfree" }, { status: 502 });
    }

    const orderObj = orderDetails.data[0];

    if (orderObj.payment_status !== "SUCCESS") {
      return NextResponse.json({ error: "Payment not successful", details: orderObj.payment_status }, { status: 400 });
    }

    await connectDB();

    const built = await buildBookingDocument(orderId, bookingdata ?? {}, orderObj, user);

    // Generate PNR and ensure uniqueness
    let pnr = generatePNR();
    let tries = 0;
    while (tries < 5) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Booking.findOne({ pnr }).lean();
      if (!exists) break;
      pnr = generatePNR();
      tries += 1;
    }
    built.pnr = pnr;

    const saved = await Booking.create(built);

    return NextResponse.json({ message: "Booking saved", booking: saved }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving booking:", error);
    return NextResponse.json({ error: error?.message ?? "Internal server error" }, { status: 500 });
  }
}
