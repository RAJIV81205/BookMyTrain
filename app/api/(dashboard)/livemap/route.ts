import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NjkzNTM5NjIsImlhdCI6MTc2MDM4Mjk1Mzk2MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiVld2VUd2VUlzY2xhIn0=_NDgzM2NmMTU5YWFkMjUzMDRjYzczODI1NjFkNzhlMDNjZTE5YmE2MjZkMDQzODkwYmM1MTJkY2ExYzc3MjNiNw==",
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
