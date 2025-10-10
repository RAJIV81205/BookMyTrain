import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMDYxMTE4MzEsImlhdCI6MTc2MDExOTcxMTgzMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiYm5DUGVMTU5TWTFXIn0=_YzdjMGNhZTk5OGYyZGZiMjBmNTZlZjZkNzk0M2JlOTM2ZmJmZjg0YzZhNDA4MmRlYzBlYmYzZTMwMmZkYmE1ZA==",
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
