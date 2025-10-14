import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1NTk3NzM2NjEsImlhdCI6MTc2MDQ3MzM3MzY2MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiNm90WUYyWE1rQVFrIn0=_ODE5ODhmOTQ2ZTIzMzg4Njk5NGQwZmVlNmI2YWQwOWZlMzYwNmIzY2YxZGNjNjY1MGVjZWFlNWQxNmI2NjQ3OQ==",
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
