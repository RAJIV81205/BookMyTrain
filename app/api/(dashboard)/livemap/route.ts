import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3MTA4OTcwOTEsImlhdCI6MTc2MDYyNDQ5NzA5MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoick9nYnRjMVdrOEZVIn0=_MTNjMjdiMmVmZTc4MGE2NWNiZjA0ZDQ0YjIyZDhkZWIwODliNmM4ZjI5Y2MwZjIxOThjZGM1Y2ExODZiYjhmYQ==",
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
