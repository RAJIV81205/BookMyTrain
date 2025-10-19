import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5NjM4OTg0NzMsImlhdCI6MTc2MDg3NzQ5ODQ3MywidHlwZSI6ImludGVybmFsIiwicm5kIjoieEw4bnMwQWZEeGQzIn0=_ZmVjYjU0M2M5ZDNhMTE4ZWQ1MDgyNzc3NTBkMThlZDBmYjgyYzg2NzAzYTEzZTY0MWMzMDU0ZjdiMTk0MzIwNw==",
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
