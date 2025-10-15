import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2MDY1OTAxNjgsImlhdCI6MTc2MDUyMDE5MDE2OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiVlZUSWliaTA3MkZuIn0=_MDRiY2I0YTEyOGE0ODdjMTVkOWNiZDk1NzUyOTRkM2YzZGNmOWY4NzQyOTYxNmVmZWE3ODgzYmE2MTQ1NGQ3MQ==",
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
