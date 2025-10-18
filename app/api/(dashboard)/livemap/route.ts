import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NTExMjM4MTMsImlhdCI6MTc2MDc2NDcyMzgxMywidHlwZSI6ImludGVybmFsIiwicm5kIjoiSzhqRkdFMTBRM2Y2In0=_MDIwMzQ5Zjc4M2U4Y2ZjMGU1NGUxMTJiODE1OWQxMTg1OWVhOGE4ZDdmNGVkNjNjNmQwNGY2NTg5ZmY1ZWVmNQ==",
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
