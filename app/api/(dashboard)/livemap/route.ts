import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2NDYyNDAzOTksImlhdCI6MTc2MDU1OTg0MDM5OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiMlNYNVp6Q28yUkFDIn0=_Yjk4M2I5N2Y1OGVhNTBhYWU4NmNhYjFkZDBlMThhZTc3ZTFhNWM3NTQ4MDNmMWQ1ODExOGFiMjI3NGYwYzZjMg==",
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
