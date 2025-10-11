import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNDYyODg4MjksImlhdCI6MTc2MDE1OTg4ODgyOSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiWDhhYmg4WUZsNFBvIn0=_OTc2YjhkZTRlMzMxNDJkYWU4MTUzMjdhM2IyODIzYmJjNGJiZDg3Y2NlM2IxNDRlMTQ3ZjJjNjQwMWM0ODdkZg==",
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
