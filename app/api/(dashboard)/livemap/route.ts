import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzMTk2MjI4NDEsImlhdCI6MTc2MDIzMzIyMjg0MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiY0hRbWs0aXc1YVJqIn0=_YmVlYTkzZGMwNzEyYmU2ZTI0NjA4YzQ3ZTU4ZDRiYzExY2ZhOTgxYTE2ODVjNzUxODc1OTA0ZThlMzQyNGQ0Mw==",
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
