import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4Nzc1MDQ5MDMsImlhdCI6MTc2MDc5MTEwNDkwMywidHlwZSI6ImludGVybmFsIiwicm5kIjoiRGQxelkySzJlQlNjIn0=_Yzc2MWJiMWMzMDM2Nzg5M2VjYjZlNjg3OTM1NGM2ZmRkZmY4MTllMTdmMjg5YTZmNjc5OWMxMjVhM2M5MWIwYw==",
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
