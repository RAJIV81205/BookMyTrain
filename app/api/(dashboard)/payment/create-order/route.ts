import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";

const cashfree = new Cashfree(
	CFEnvironment.SANDBOX,
	process.env.APP_ID as string,
	process.env.SECRET_KEY as string
);


function createOrder(amount: number, email: string, phone: string) {
	var request = {
		order_amount: amount,
		order_currency: "INR",
		customer_details: {
			customer_id: "node_sdk_test",
			customer_name: "",
			customer_email: email,
			customer_phone: phone,
		},
		order_meta: {
			return_url:
				"https://test.cashfree.com/pgappsdemos/return.php?order_id=order_123",
		},
		order_note: "",
	};

	cashfree
		.PGCreateOrder(request)
		.then((response) => {
			var a = response.data;
			console.log(a);
		})
		.catch((error) => {
			console.error("Error setting up order request:", error.response.data);
		});
}

export async function POST(request: Request) {
	const { amount, email, phone } = await request.json();
	console.log(amount, email, phone);
    console.log(process.env.APP_ID, process.env.SECRET_KEY);
	createOrder(amount, email, phone);
	return NextResponse.json({ message: "Hello World" });
}
