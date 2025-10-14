import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MTY3OTYyNzEsImlhdCI6MTc2MDQzMDM5NjI3MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiUzZDQzBtSkQ0NEVjIn0=_MzIyMmYxYjk3YzZiZGQzMWMyOGE2ZTJhOGUwYjNmM2JlYmE0N2M5MzVhZjc5YWQyZTU4ZjM1Y2ZiNjhkYTExZg==",
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
