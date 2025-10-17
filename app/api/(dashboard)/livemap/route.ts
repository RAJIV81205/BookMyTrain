import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MjU5MjIzNzAsImlhdCI6MTc2MDczOTUyMjM3MCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiUjBtbjNRNFVtVU9GIn0=_MTlhNGIzZGU5NTI0M2QwYmJiZTg0YjcwZThkYzM0ODM0MTA2MDVmNDRhNTYzOTRjYzFjYjQzMmViNzE0ZjliYQ==",
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
