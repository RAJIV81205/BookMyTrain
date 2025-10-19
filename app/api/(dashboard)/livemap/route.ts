import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5Nzc0MDE1MzksImlhdCI6MTc2MDg5MTAwMTUzOSwidHlwZSI6ImludGVybmFsIiwicm5kIjoidUZUTnBjRkw3dTdpIn0=_NjRiMGEyZDg1YmE4ZmQ1OTM2MjA2ZDJkM2M0YjVhODYyYTU5NzUyYTlmYTM2MjNhZmIzZjY1NTA4YWQ1NTM0Zg==",
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
