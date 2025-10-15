import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2MTg3MTEyNDMsImlhdCI6MTc2MDUzMjMxMTI0MywidHlwZSI6ImludGVybmFsIiwicm5kIjoianA0ekNCY255ck9JIn0=_MTkwZTk2NGEyODAyNDY2YWFlYTcyY2JhYmI3M2IyODA1M2YyN2Q5ZGRmOGQ0Yzk3NTQ4M2Q0NDM0NWY3ZGNmYg==",
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
