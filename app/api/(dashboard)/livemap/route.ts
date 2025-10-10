import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMTc0MjM0NzUsImlhdCI6MTc2MDEzMTAyMzQ3NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiUjZoSHl6RUF1dEpZIn0=_YmZiY2Y2MDdjNjExNjcwNDE0NzE0NzYyMTZiYzU2NDhkNjBmMjIwNDk2ODIzMTUxNGU5ZGMwZWM3MDFhMTY2MQ==",
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
