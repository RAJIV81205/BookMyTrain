import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzMjk0MTI3NDgsImlhdCI6MTc2MDI0MzAxMjc0OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoic3FqVm50cjNDY3AyIn0=_MWNiN2Y5ZmRiNDc0MzQwNWEzNTdiMWQwMDY2OTU5ZTNmMWEwOGI5OGE1ZmMzNjFkMTQ3Nzc1YjZhN2ZiYzAxNA==",
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
