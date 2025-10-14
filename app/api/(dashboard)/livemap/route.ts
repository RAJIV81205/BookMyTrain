import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1NDE4MTU0OTksImlhdCI6MTc2MDQ1NTQxNTQ5OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZmVKTXJWOGxwTVc5In0=_ZTQ0ZTFmMmQ0N2ZkMDJjZDVlYjZlNzdhM2IxN2I5OWZiZDJmMDUyOGNjNWNiOGJiNzFlMDE2ZGNmOTc5MThiMw==",
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
