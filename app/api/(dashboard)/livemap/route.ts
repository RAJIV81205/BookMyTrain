import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjEwMTY2MTkyNTAsImlhdCI6MTc2MDkzMDIxOTI1MCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiTmlNbE95NEFUQjU0In0=_ODA4NTVjNTk2OTA5OGM2NDVhMzI1OTE0MTM4M2I2ZmQ5ZWZhNDU2Y2I2ZDNhNDlmYWQ5YWM5ZjRkYTllMmZmNg==",
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
