import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(
      "https://railradar.in/api/v1/trains/live-map",
      {
        method: "GET",
        // headers: {
        //   "accept": "*/*",
        //   "accept-language": "en-IN,en;q=0.7",
        //   "content-type": "application/json",

        //   // 🔥 CRITICAL: Browser fingerprint headers
        //   "user-agent":
        //     "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",

        //   "sec-ch-ua":
        //     `"Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"`,
        //   "sec-ch-ua-mobile": "?1",
        //   "sec-ch-ua-platform": `"Android"`,

        //   "sec-fetch-dest": "empty",
        //   "sec-fetch-mode": "cors",
        //   "sec-fetch-site": "same-origin",
        //   "sec-gpc": "1",

        //   "referer": "https://railradar.in/live-train-map",
        //   "origin": "https://railradar.in",

        //   // Optional but helps bypass heuristics
        //   "x-trace-id": `${Date.now()}.${Math.floor(Math.random() * 1000000)}`,
        // },
        // cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: "RailRadar rejected request",
          status: response.status,
          body: text,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Fetch failed on server",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
