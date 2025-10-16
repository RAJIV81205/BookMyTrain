import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3MzI1ODUxOTgsImlhdCI6MTc2MDY0NjE4NTE5OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiU0V6a2d6Vzl5eHVjIn0=_OWMyNzM5NjI4MjNmMjBiNTU4OWMwM2E1ZGMwYzlkODBiYTNiM2NhYzFlYzM5YTg5YTAzOWVmNzhjYjBhZDFhZg==",
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
