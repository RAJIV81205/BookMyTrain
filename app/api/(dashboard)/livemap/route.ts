import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NjIyNzY4MDUsImlhdCI6MTc2MDM3NTg3NjgwNSwidHlwZSI6ImludGVybmFsIiwicm5kIjoicjJDNzE2RElEalVJIn0=_OTg0MTU3NTg2ZTRlYTc3MDNmNGU0MWM4OTQ3MmViNWU5ODlmODcxZTEzOTE1ZmRiMDI5ODE4MWIzMDUyYjZhOQ==",
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
