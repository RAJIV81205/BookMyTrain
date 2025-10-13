import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0MTkyNDMzNjAsImlhdCI6MTc2MDMzMjg0MzM2MCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiNEJrVURFbldxQ3NpIn0=_ZWVlZDljOWE5ZDU0OWJlOTM2ZGY2MzM5YzRjZjhjOGYwMTg0ZjdlZGJhYjE5ZmE2MjNiNGI0ZGFkYTMzYjQ4ZQ==",
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
