import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNzU3NTcwMzcsImlhdCI6MTc2MDI4OTM1NzAzNywidHlwZSI6ImludGVybmFsIiwicm5kIjoiWUhpd2h0SkNGV2ZFIn0=_OTFkODc1NWFmMWY0MjI2ZmM3NTdmZDdkZmQwODg2Y2QzYzkyMjQ1OWM3OTI3NjdiOGE1N2E2NjYzN2JlYWY1OQ==",
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
