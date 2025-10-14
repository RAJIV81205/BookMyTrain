import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MDk4OTA1NzEsImlhdCI6MTc2MDQyMzQ5MDU3MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiS0c2dDBRaVRRbVRsIn0=_ZDk4NzcxM2U0OGMzNTgwZWM1NTk4N2E3NmNkNDdkZGU5ODUyOWVlNmE4MDEzZTNkZjc0MjUyNzU5OGYwM2YwMw==",
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
