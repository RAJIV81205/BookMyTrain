import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0MjY0ODI1NTksImlhdCI6MTc2MDM0MDA4MjU1OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiTEozUnNqOXo2RFRhIn0=_YjFmZjI4NTFkMWU2OGZmMTQ5ZGE2NDU1NWFhMzI0YmZhZTM2ZjU1MDgzMzZmNGVhMjdjZWFiZTE2YzMzODg0Mw==",
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
