import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NzI1MTUxNDMsImlhdCI6MTc2MDc4NjExNTE0MywidHlwZSI6ImludGVybmFsIiwicm5kIjoiMktubkNvR2JQdUVIIn0=_NWI2NDVjNmQxMzc0YjBjNmJjMmQ5MDc5MzlmMTZjNWYzMGVjMTkyMDNjMDVhNzhjY2VlOWI3MTE1Y2E3YjI0Zg==",
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
