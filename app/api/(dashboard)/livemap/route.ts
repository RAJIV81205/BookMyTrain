import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NDI1NjYxMTYsImlhdCI6MTc2MDc1NjE2NjExNiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiUkYzQlQyQWNVZTZ0In0=_YmJjZjczM2FiNzg4OGFlZTE1YzI2ZTE2NDczMTFhYzI3ZjY5ZTMzODliNmU0NzQzNTBlMmNkNDM2NzIwNTMxNw==",
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
