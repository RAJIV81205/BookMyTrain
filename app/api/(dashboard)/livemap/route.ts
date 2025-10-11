import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNzI2MjU4NDQsImlhdCI6MTc2MDE4NjIyNTg0NCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiNUU3NWZPNjA5bGtiIn0=_Y2NjNWY3YjBmNWNkYWQwOTdjYzBmNmM5YzA3ZjU5MjM3MzlkOTA0MGY1ZWFiNDhjOWZhMjU0Zjk3MTExMjM1NQ==",
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
