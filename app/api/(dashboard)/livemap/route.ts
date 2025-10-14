import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1NDU2MjA2NTEsImlhdCI6MTc2MDQ1OTIyMDY1MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiR09ISDl5TjhmWGhPIn0=_MjYzNjkxZmRiY2M4MTQ0Zjc5YjEyNWU3YWE3NGU4NzhhNDhiZTIzZmY1NGMwYWY3ZTFkMWU3MmNkYzYyODdjMA==",
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
