import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MTg5Njc3MDIsImlhdCI6MTc2MDczMjU2NzcwMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiaHo1aTY0aU9DMGVTIn0=_YzNiMWI1Zjg4MzExMGM5NGM0YzljY2Y1NDM1NWM0NDgyYmUxYjkyYzc3Y2Q2ZTZhMWFmZmJjMmY2ZTQ1ZDBhZQ==",
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
