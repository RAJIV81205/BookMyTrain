import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NTkxOTEwNDYsImlhdCI6MTc2MDM3Mjc5MTA0NiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiR2pUYlp6UWQ1eEVBIn0=_YzBhMDk5OTQwNjcyZTFmOGU3MTY5ZjU1Mjk0YzQ5YWI0YTM1ZmVhMDJiYTU1MjIyNGQzYjkzMzZiN2Q0MjczZA==",
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
