import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5OTE2OTAxOTUsImlhdCI6MTc2MDkwNTI5MDE5NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRVcxSmxlNURPV29BIn0=_ZTM0Mjc2YmNhOGU1OTA0MDgxMDdmMzFjYzY5ZTg1NDcwZTI0OGEwYWMxMmU3MzQxNzU1NGJmZThlNDAzMDM0Mw==",
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
