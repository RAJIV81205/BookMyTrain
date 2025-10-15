import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2Mzk0OTgzMTcsImlhdCI6MTc2MDU1MzA5ODMxNywidHlwZSI6ImludGVybmFsIiwicm5kIjoia0dNNjFCZzFOd0xnIn0=_YzU2YjAxZWVjZDg4NjkwNTEyZmQzNzE2MzhhODllYzNhNzg1M2VkMDU4N2FjZmI5ZmMwM2E0NjFiYTA0ODg2Mw==",
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
