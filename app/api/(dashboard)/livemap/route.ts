import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNjc3MjA0ODMsImlhdCI6MTc2MDE4MTMyMDQ4MywidHlwZSI6ImludGVybmFsIiwicm5kIjoiN3lBNVRzMHlHVno0In0=_ZmI2ZDc4OGFkYmJhMWRiZTI3MzhhYTZjOTFmOGUzMTE3YzBjZDg4Y2VlNDhmYzE3MTEyZTU3MWE2NTRkNzgyMQ==",
        Referer: "https://railradar.in/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // If you want strong typing, define ApiResponse separately
    const data: any = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
