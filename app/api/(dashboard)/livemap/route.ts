import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjEwMzYwNTEyOTUsImlhdCI6MTc2MDk0OTY1MTI5NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiMGdENzhmSml5ZHNBIn0=_NDY0Njg5NTIzNWI4MDdiOTBjNGQ1YTg0ODg0NGRkMzc4ZmVmZGQ2OGEzMjljMTFlMDQwYjM2MDg1NDczMGE0OQ==",
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
