import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNzUzMjIxODUsImlhdCI6MTc2MDE4ODkyMjE4NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiMGdNMXEwRk15bVduIn0=_MWZhOTE3NzIyYjEzZDM0ZDIzMjE5ZDBlZGJmNGMxYzBjNTRjY2Q0MWNmMmM1NjQyZDBkYTUwYWFhMjk4YzI3Yg==",
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
