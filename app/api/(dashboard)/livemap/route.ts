import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5MTIyODAwNzEsImlhdCI6MTc2MDgyNTg4MDA3MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiaEhobzduTGJWMjhFIn0=_MjAxODg2MzE1MDZiMTgzYjMyYTMwYmZkNTQyMGE1ZjM4YmYzZTBmNTIzYmZkOTcxNGQ1M2IxYjIyOWZjMTU0Mg==",
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
