import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMjQ2Njg3NTUsImlhdCI6MTc2MDEzODI2ODc1NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoia1JncURzV2g1RGlGIn0=_ZDQ1MjM3YTRiMGMyMGVmODNmMzEzMTE3OWZiNTU1MWE5NjZkYmUxNWUxOTJjOTYwMTEzMzg0NWNjNTA1NjA5OQ==",
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
