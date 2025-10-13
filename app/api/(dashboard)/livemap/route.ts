import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0ODAzMjc1NDEsImlhdCI6MTc2MDM5MzkyNzU0MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiTWRRVm1tTlBSQ0dFIn0=_NDhmNjM0MzgxMWI2NTQxZjhiMTljMzI3ZmI1ZGU0NDYyZmVjZTIxZTZkOTk5YmE5YTUzODg3NDAzNzdhMmUyNQ==",
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
