import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5OTg3Mzc4MjEsImlhdCI6MTc2MDkxMjMzNzgyMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiVjBBUGRRZ3VncWF2In0=_MGRhN2U2Y2Y4M2MzZDk5ZTkxMmI1NWM4OTM5YTg5MDFjMDAxMzhjZDBkNjY4YmFhODYwOTQxZjQ2OWEyNmE1Mg==",
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
