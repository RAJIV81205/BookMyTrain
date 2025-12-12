import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.NEXT_PUBLIC_APP_ID as string,
  process.env.SECRET_KEY as string
);

// -------------------------
// CREATE ORDER (ASYNC)
// -------------------------
async function createOrder(
  amount: number,
  email: string,
  phone: string,
  id: string,
  name: string,
  orderId: string
) {
  const request = {
    order_amount: amount,
    order_id: orderId,
    order_currency: "INR",
    customer_details: {
      customer_id: id,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
    },
    order_meta: {
      return_url: `https://yourdomain.com/payment/success?order_id=${orderId}`,
    },
    order_note: "",
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    return response.data; // Return Cashfree response to caller
  } catch (error: any) {
    console.error("Cashfree order create error:", error?.response?.data || error);
    throw new Error(error?.response?.data?.message || "Failed to create Cashfree order");
  }
}

// -------------------------
// ORDER ID GENERATOR
// -------------------------
function generateOrderId(): string {
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const now = new Date();
  const month = monthNames[now.getMonth()];
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${month}_${randomNum}`;
}

// -------------------------
// POST ROUTE
// -------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, token } = body;

    if (!amount || !token) {
      return NextResponse.json(
        { error: "Amount and token are required." },
        { status: 400 }
      );
    }

    // Verify user
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 }
      );
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order
    const orderResponse = await createOrder(
      amount,
      user.email,
      user.mobile.toString(),
      user._id,
      user.name,
      orderId
    );

    // Success response to frontend
    return NextResponse.json(
      {
        message: "Order created successfully",
        orderId,
        cashfree: orderResponse,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong while creating order",
      },
      { status: 500 }
    );
  }
}
