import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNDM4NTE1NTMsImlhdCI6MTc2MDI1NzQ1MTU1MywidHlwZSI6ImludGVybmFsIiwicm5kIjoiaEF1ZGpTZzh6STROIn0=_YzRiYmQ5ODA0YzhlYjU0M2NiMzk2NWFhNmQ3MWQ2NDE5NmU3MjM4NjkxMWIwNDE5YmFiYzUzYmFjNjc2YTFkZg==",
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
