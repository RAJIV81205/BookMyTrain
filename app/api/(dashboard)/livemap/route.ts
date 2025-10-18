import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5MDg2MDQ1NDIsImlhdCI6MTc2MDgyMjIwNDU0MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiamd0ZHRYTlZmUXMxIn0=_MzIzNTdjNTE1YjE2MGFkNGZlMWJlNmRlZTg1Yjc5Y2IwYWZmNjc5ZTcwYzlmNDJmZDFhNmI5YTA5YWM1OGIyMA==",
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
