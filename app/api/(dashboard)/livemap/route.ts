import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5NDE3ODI5MjksImlhdCI6MTc2MDg1NTM4MjkyOSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiOW9TVXVFdHd3NWhzIn0=_NzY2NTgyYzc3ZjhhYTA4MTVjMzA5ZWFmNjZiODI5ZjgzZGRkNDA3ZmYwZTNlM2YyYzBlMmJiMWMwMDc3NmUxYw==",
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
