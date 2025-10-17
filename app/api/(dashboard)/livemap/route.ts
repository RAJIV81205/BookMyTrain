import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MDA4NDc1MTUsImlhdCI6MTc2MDcxNDQ0NzUxNSwidHlwZSI6ImludGVybmFsIiwicm5kIjoidGxVdU9HM0t6enRUIn0=_ZTI2NmJlMWU5NWM0ZmE1ZWFmZGMxYTFmNzgyZjlmZDhkMGVkNGRhOWYxNmRjNThkM2VlZGU5Mjc1NGQ5OGVlNQ==",
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
