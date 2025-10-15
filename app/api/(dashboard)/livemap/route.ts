import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1ODM5NjMxMDIsImlhdCI6MTc2MDQ5NzU2MzEwMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiM3dIdjhBelJLdk5tIn0=_YjU0MjU1YTI2NmExZGMyOTIyYTVjZmFlMDM3NDIxOGM0MWUwZWQzNTkxY2ZkNTkxOGY4ZWRlM2QwYmNlZDFiNA==",
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
