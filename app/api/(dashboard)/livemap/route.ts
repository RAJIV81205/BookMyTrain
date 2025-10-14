import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MDU1NzcyMzYsImlhdCI6MTc2MDQxOTE3NzIzNiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRmJSN2lxZkNtaW94In0=_MTBjOWRjNzkzNTg0NTBiYWFhODA3YjBiMTIzNzU3YzY4OTk0NDdmYzE0MWExYzIwMWZmZmRiNWNhNTNhMjkzZA==",
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
