import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MzgxMDM4NjcsImlhdCI6MTc2MDQ1MTcwMzg2NywidHlwZSI6ImludGVybmFsIiwicm5kIjoieTRCMnNmSExUd01rIn0=_YTY4YzIzNzkwZDQyZWU1NzIwZjNkNjE3OTBjMzJjZjM3YTdmMGUyNTQ2NTViY2JlM2E2OTM3Y2RmODA3N2UxZA==",
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
