import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NjIzMTIwNzQsImlhdCI6MTc2MDc3NTkxMjA3NCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZW93Z1dnbk5ub0RFIn0=_YjhmNWRiNDQ5YWMxZTk1NGJjZjcwZTNkYWU3NmRhNWQ2ODU5OTYyODgwOTRjMWMxMTFmMWMwMzFhNDU4OTUyNQ==",
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
