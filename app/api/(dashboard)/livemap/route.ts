import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3NjkwNTA3MDksImlhdCI6MTc2MDY4MjY1MDcwOSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiVUNIWHBBNm1NVm9CIn0=_Yjc1ZTE1N2QyODI1ZTg5YzU4NmFiZWNiZTc0MzcxMjkxNzBiMTAyOTU1ZGM4YjMyYjY1OGFhYmUxNWJjYWNjOA==",
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
