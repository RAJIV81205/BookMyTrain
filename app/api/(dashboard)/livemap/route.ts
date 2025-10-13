import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0NjY1NTEzMDEsImlhdCI6MTc2MDM4MDE1MTMwMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZ2dIYzVKR1h3RW8yIn0=_N2QxYTI1Y2E3ZTI4NWE1MTVjZWVmNGQ0MDkyMDFmMjcyNDMxNzlhMDc3OWVkMTQ5ODQ5MWJhODE3NGM2NzQ1OA==",
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
