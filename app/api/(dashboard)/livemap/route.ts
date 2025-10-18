import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4ODM0MjIzNDgsImlhdCI6MTc2MDc5NzAyMjM0OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQWxtb1ZKZDV2bGdTIn0=_YjY1YzdhMmE1N2FjMWExZDUxMjc1ODg1YWQxZTMxNDhlMDY0Y2FhYmUxYTcyMmUyMDgyNmVjYmM2N2ZhNWRlYQ==",
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
