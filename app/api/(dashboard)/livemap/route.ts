import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4ODAyMjgyMDAsImlhdCI6MTc2MDc5MzgyODIwMCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRDlaTzhUUmFLcjN3In0=_NWI4MjRiYWIxMGUyY2I2OGFmY2YxN2I1ZGZiOTczY2RkYWU3MTdhYmZhYTgwYzkzZmMxNzQ3Y2U5NmNhYTZiNQ==",
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
