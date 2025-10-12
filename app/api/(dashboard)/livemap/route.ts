import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNDcxMTE2MjMsImlhdCI6MTc2MDI2MDcxMTYyMywidHlwZSI6ImludGVybmFsIiwicm5kIjoiNzF3bkVVMlpQb082In0=_YTI3ZmYwNTg2ZGMwMWIwZWViYTYwNzYzY2RhNmY0ODM0NmE1YmRkOTIyMTRkMzlmM2U3NTI3YWU3NWQzMDI5YQ==",
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
