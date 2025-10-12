import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzODAwMDYzMDIsImlhdCI6MTc2MDI5MzYwNjMwMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRkowemJ2ZU5yUGw5In0=_OTlhM2Y1M2E0NDljMDMwODVmZGU3NGUyNDczMDJkM2FkOTQwMTljMDY3YzdiM2ZlZTY5ZDY0YTQ5ZmY3YmU0MQ==",
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
