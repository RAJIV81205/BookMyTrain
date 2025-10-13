import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA0MzA2MjM3MTEsImlhdCI6MTc2MDM0NDIyMzcxMSwidHlwZSI6ImludGVybmFsIiwicm5kIjoieUpZUTJSVmRQWGgxIn0=_OTEyM2E5NGVkYjhhN2QxZjhmN2ZjZTRmZDI2N2NhMDg4M2U4NjcxODRmNDdkYWY1MjM0OTg4ODU5YmM1Mzk4Ng==",
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
