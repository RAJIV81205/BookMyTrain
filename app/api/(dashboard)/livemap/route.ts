import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNTA0NTEwMzQsImlhdCI6MTc2MDE2NDA1MTAzNCwidHlwZSI6ImludGVybmFsIiwicm5kIjoibGZmRUxkMkVpUldNIn0=_YjkxMTE0ZTI3YWNjNThhZTdlNDRkZTU1NzE2NzM5YjcwNDE3NDRjNDk5YzU1YTBmOWUyY2FlZDI0ZmI2MTUzZA==",
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
