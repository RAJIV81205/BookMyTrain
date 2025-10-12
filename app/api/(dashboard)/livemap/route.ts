import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNjg2ODcyNTIsImlhdCI6MTc2MDI4MjI4NzI1MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiOVVhTU50RUJmMWxlIn0=_ZDM4NzU0MjAxNzRkN2E3ODFkOTQ5NTg5ODZkMzhjMzI0N2ZhMjE1MmIzNWM0NmQ1MTU3NTE2ZDk5YzhkYTUzOA==",
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
