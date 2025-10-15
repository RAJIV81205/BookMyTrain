import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2NDIyMTIyMDgsImlhdCI6MTc2MDU1NTgxMjIwOCwidHlwZSI6ImludGVybmFsIiwicm5kIjoidldLQ3pHYlZZSmluIn0=_NWZlNDVkN2JlZDVmNmQwZGE2ZTM4YzYwODU2NThlMDZkNGY5OTRjNmU5MTE4NjkxYTllMzljZjNlNGY1MDM5Yw==",
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
