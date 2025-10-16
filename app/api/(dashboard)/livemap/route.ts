import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2NzUwNjk1NjUsImlhdCI6MTc2MDU4ODY2OTU2NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoia3JGbDh2amQ5VzdRIn0=_ZDcxZmRjYTA5NzE0MmRmMTRiNTg5ZWJlY2U1MWE5OGQ4YmJmYmE4ODQ0NmNhZjRkN2Q3Y2RiZWRjMmRhMGJmNA==",
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
