import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0OTczMDUzNzEsImlhdCI6MTc2MDQxMDkwNTM3MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZ0g1a0lwYmlRWjUwIn0=_OGEzMzMzMzRkYzhhMGNjMGZmZGQyM2Q5M2VlMDU4MTAzMzk2MDg0YjY1OTQ4ZDQ2OWUzMDM1YjI1NjU0ZmZiOQ==",
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
