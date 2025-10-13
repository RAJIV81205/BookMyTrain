import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NDU3NzgyOTAsImlhdCI6MTc2MDM1OTM3ODI5MCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiTTlwYVFUckM4Rm1XIn0=_NDczN2E4M2Y4MjljMTMxMmFmNjhjMDk2ZjQ2YTJmM2Y5NWY2YjBiMmRiMWEyODg2NDk1OTBjMWE2YWFhNDE0Mg==",
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
