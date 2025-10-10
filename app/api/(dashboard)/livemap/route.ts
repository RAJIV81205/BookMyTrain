import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMDczNjMxMDEsImlhdCI6MTc2MDEyMDk2MzEwMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiVG9OdVBSZWxaUERWIn0=_OTE4NzQ4NWI1YjJkOTkxMWVjYzc4ZTM1M2YyMDE2YWM3NTU4ZGRmYzJkNzFjMjI2MGY4NDdiMGYzOTBlMDZmNQ==",
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
