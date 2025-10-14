import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0OTIyMzY4ODcsImlhdCI6MTc2MDQwNTgzNjg4NywidHlwZSI6ImludGVybmFsIiwicm5kIjoiVkhvYU9qM29vSkxzIn0=_NGFkNTBiMDRmNzdiZmUxYWZhOThjNDUwNGI2ZjNhNGI3M2Q3ZDZkOTY4OWUxMTVjYmEzNzkzODZiZmJjMWJlZA==",
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
