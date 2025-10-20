import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjEwMjgzNjkyMTksImlhdCI6MTc2MDk0MTk2OTIxOSwidHlwZSI6ImludGVybmFsIiwicm5kIjoia3dzUHRlVUdxVkpHIn0=_NTdhNWM0YWIzMDE0MzFjMWM0YjZjYTJlYThhOThmODEzNTEyMWMyN2E3MGIwODZjNTc2MDQyMzVmY2UwYWQzMg==",
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
