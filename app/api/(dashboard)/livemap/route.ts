import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MzUwODA2MzQsImlhdCI6MTc2MDQ0ODY4MDYzNCwidHlwZSI6ImludGVybmFsIiwicm5kIjoib1FEenlsRXJwWWkwIn0=_ZGM5ZGQ2ODc0OWE0ZWFhNmE3YWM4MTg3NmRkYTNkZjc3NWU0NTkzZmExOWZhYzkxZDdkNDk5M2Q2NzEzOGYwYg==",
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
