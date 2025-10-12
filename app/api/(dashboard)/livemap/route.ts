import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzMzY4NTgxNTcsImlhdCI6MTc2MDI1MDQ1ODE1NywidHlwZSI6ImludGVybmFsIiwicm5kIjoidkd0TWhBZmVVaHNNIn0=_ZGZhNDg4ZWU3ODhiOTAzMjk2OGE2NDZjYjVmNThkNTUyNDQ4ZjE1NTM2YTg0MWRjZmFiNGI5ZDJiMzBmNGM0Mg==",
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
