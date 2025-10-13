import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NDA2ODE0NzcsImlhdCI6MTc2MDM1NDI4MTQ3NywidHlwZSI6ImludGVybmFsIiwicm5kIjoidFI2ak9xaXoxRWdTIn0=_NGY2N2FmNjc0ZjllODZkNzYzZjU2ODE5ZGU2OTA0NmY1NDNkMmIyNmYzM2Q0MzVkOTgyNjc3MjY4YTExYmI5Yw==",
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
