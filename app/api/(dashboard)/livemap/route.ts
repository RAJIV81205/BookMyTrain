import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNTA3NTU4OTAsImlhdCI6MTc2MDI2NDM1NTg5MCwidHlwZSI6ImludGVybmFsIiwicm5kIjoia0xPWWU2Z1huZGNXIn0=_ZjVlYTBmMzVlMTUwY2JlMDI1M2M5OTYzZTU2MTRjOGQ1ZmRlN2Y2OTA3Zjc4YWUzMzE5ZGU5NGZjYjA0ZDc2YQ==",
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
