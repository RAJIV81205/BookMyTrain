import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzODI4OTEyNDgsImlhdCI6MTc2MDI5NjQ5MTI0OCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiemhHU0dXcHVGM2JHIn0=_MzQ5MmE2Y2M2NjE1MjgzN2JmMTVjMGNhMTU3NzMzZjBkMTU1OTBiYTgxY2Y2M2IwZWI3NjY4NWIyMDMzNDA0Mg==",
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
