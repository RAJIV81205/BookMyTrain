import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0MjM1ODc0NzgsImlhdCI6MTc2MDMzNzE4NzQ3OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRm9zMk93YTRGQUdRIn0=_NWYyZjY3YmEyYzUxMmQ4NGY2YTE1OTViYjVmYWRiYjA3NGE0ZGY3ZDZjZjIzYTI3ZjMzZWI4YzZlNjRkNGZlNg==",
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
