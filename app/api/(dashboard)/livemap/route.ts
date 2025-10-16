import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3NDMwMjk4NzMsImlhdCI6MTc2MDY1NjYyOTg3MywidHlwZSI6ImludGVybmFsIiwicm5kIjoicThZMVhQdzM5TGRXIn0=_YjRmNWFiMTNlYTFkOTk0MjYzZDgwMDEzZTdmMjhjMzZjMmM5OGZkNDY1MjNlNGE0ZTNjODNmMjk4MWE2YmE1Ng==",
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
