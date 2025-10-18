import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MzcxNjYxNzMsImlhdCI6MTc2MDc1MDc2NjE3MywidHlwZSI6ImludGVybmFsIiwicm5kIjoiN2lFNkEyc25EdEVzIn0=_ZDZlMmYxMDFiNGU1YmJlYWMwNWY4NDBkNjE5NGYwY2U3YjY5YzVkZWU3MjRhOGNjMTE2MWE4OWJlYjY2OTBiNA==",
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
