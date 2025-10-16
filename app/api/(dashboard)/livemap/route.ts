import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2NjUxNTgzMjQsImlhdCI6MTc2MDU3ODc1ODMyNCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRUxFUFpVTVJKeWpLIn0=_YjYzZDc3ZjhiYjc2MWNiNGM2NDQ5OTBiYWMwNjJhNmNmY2ZlOTUzNmM3ZmI3MDY0YTIxZjI0Y2MyNGQzMTc2Nw==",
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
