import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NTUyNzM4MjEsImlhdCI6MTc2MDM2ODg3MzgyMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRUxtSUVOd1RONTd2In0=_ZGIxMTQxYTliNzU1OTRmMjk5NTk4NGVkNTc0MjA2OGNlMTUwMDM1ODA3NGNmMWQzOWVhMzYzNjYwNThmY2QxOA==",
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
