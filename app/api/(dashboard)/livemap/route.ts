import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MjcwOTI1MjUsImlhdCI6MTc2MDQ0MDY5MjUyNSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiWkJZdFFORTFjOGc1In0=_NjYyMDVmNWZiYzRhYzIyMGQzMDgwZjE0N2EyNGI4NDc4NDU2NGIzMzA0NjYxNTQyYWRiNzYyZjk1OWJmNWE4YQ==",
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
