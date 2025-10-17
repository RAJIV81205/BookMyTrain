import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MTQ5ODk2ODUsImlhdCI6MTc2MDcyODU4OTY4NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoicEtXWk1ZRjRjaDhRIn0=_MjIxYTVlNTYwYTg4OWFmYmEyMGM0ZWE5MGY4YWI1OGJkODAwMDIwZWZiZWVjMWFkZGNkZjQ3NTk4NzExMDY5Zg==",
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
