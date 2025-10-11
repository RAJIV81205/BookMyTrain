import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMzc2NzA3MzgsImlhdCI6MTc2MDE1MTI3MDczOCwidHlwZSI6ImludGVybmFsIiwicm5kIjoidDVnbUFEMDR1b3ZYIn0=_ODhkZWIwYjMzNmEwNDg3OWU1NTkwMzk5N2FkOWJlMzdkOTA2MDBmMDMxOTI5OGI4NTM3M2JjNDViYjM5MzA1MQ==",
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
