import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NDg2ODAwMDEsImlhdCI6MTc2MDM2MjI4MDAwMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiWXNaQXRCZHZjSlZaIn0=_MjViZGE2MjgxNTllN2U0YWI1ZTk3ZWU3ZWNlMTZiNTQ1M2M5MGU0MjM5ZjJkOGFmZjQ3YzhkYjBmOTAyYTM5Nw==",
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
