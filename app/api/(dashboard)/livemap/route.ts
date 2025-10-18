import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4ODcwOTg0MzEsImlhdCI6MTc2MDgwMDY5ODQzMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoidnNnZXFUVGY2eHVoIn0=_NWFjMTc3ZTNhMzkwZjJmYjZmMGEzMTUyMjdhMTE0NmE4NGUxYmVmNmU4MjQwOGYxMjI4OGY5NDczMGM0ZGEzZQ==",
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
