import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNTc0NTM4NjYsImlhdCI6MTc2MDE3MTA1Mzg2NiwidHlwZSI6ImludGVybmFsIiwicm5kIjoibHZRVmdacEhuSHdhIn0=_OWQ0ZDI3NjQ3ODg1ZTE5ODA5MzUzYjZlOWJhNTQxZDUzYTYxMTM2ZTUxZDE3ZDY4YTBkNzliN2RmZDFhMGU3Zg==",
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
