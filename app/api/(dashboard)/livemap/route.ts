import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MDIzMTEzMzUsImlhdCI6MTc2MDQxNTkxMTMzNSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiSlZVTmNmZlM0SThuIn0=_MjQzYWNhZjY1MzRlZGE5MGZhMjI1NTRhYjJjYzc0ZWE1MzBlZDU5NWU0YWM2NjE5ODU1MDYyNDdlYjNhMmZmMg==",
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
