import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5OTUwMzk1NDIsImlhdCI6MTc2MDkwODYzOTU0MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRDlBcTRPQWhMcFFaIn0=_Y2MxY2NhZGE1MWYxZmFjMDBlMTMyYjdiMDBkMjEyMDBlZGQ4ZTIxNjhmNTJlNTM0MTFmZGRmNjYxNDk4MWU1ZA==",
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
