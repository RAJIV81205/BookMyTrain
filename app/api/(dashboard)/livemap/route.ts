import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2ODU2NzM3MzIsImlhdCI6MTc2MDU5OTI3MzczMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiNVI0UHhTM3YxN2pOIn0=_ZjkwYWRiYWU5MjgzZTg0MWMwY2E5MjlkMGMyZjU0MjA4ZTE3ZjliZWI3NTcyMzVmMjU2MTVhMTIwYmZmMjI0MA==",
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
