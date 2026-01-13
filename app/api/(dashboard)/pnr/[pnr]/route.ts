import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pnr: string }> }
) {
  const { pnr } = await params;
  const cleanPNR = pnr.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      "https://www.redbus.in/rails/api/getPnrToolKitData",
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          origin: "https://www.redbus.in",
          referer:
            "https://www.redbus.in/railways/pnrStatusDetails?pnrNo=" +
            cleanPNR,
          // More realistic UA (similar to what their site uses)
          "user-agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
        },
        body: JSON.stringify({ pnr: cleanPNR }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const raw = await response.text();

    // If upstream returns HTML (bot protection / error page) instead of JSON
    const trimmed = raw.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return NextResponse.json({
        success: false,
        error: "Upstream service returned HTML instead of JSON (likely blocked).",
      });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `API request failed with status: ${response.status}`,
      });
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON response from upstream API",
      });
    }

    if (!data || !data.pnrNo) {
      return NextResponse.json({
        success: false,
        error: "No PNR data found or invalid PNR number",
      });
    }

    // Return structured data (kept exactly like you had)
    return NextResponse.json({
      pnr: data.pnrNo,
      status: data.overallStatus,
      train: {
        number: data.trainNumber,
        name: data.trainName,
        class: data.journeyClassName,
      },
      journey: {
        from: {
          name: data.srcName,
          code: data.srcCode,
          platform: data.srcPfNo,
        },
        to: {
          name: data.dstName,
          code: data.dstCode,
          platform: data.dstPfNo,
        },
        departure: new Date(data.departureTime).toLocaleString(),
        arrival: new Date(data.arrivalTime).toLocaleString(),

        duration: data.duration
          ? `${Math.floor(data.duration / 60)}h ${data.duration % 60}m`
          : null,
      },
      chart: {
        status: data.chartStatus,
        message: data.chartPrepMsg,
      },
      passengers: data.passengers
        ? data.passengers.map((p: any) => ({
          name: p.name,
          status: p.currentStatus,
          seat: p.currentSeatDetails,
          berthType: p.berthType,
          confirmationProbability: p.confirmProb,
        }))
        : [],
      lastUpdated: data.pnrLastUpdated,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({
        success: false,
        error: "Request timed out after 10 seconds",
      });
    }

    return NextResponse.json({
      success: false,
      error: `Request failed: ${error.message}`,
    });
  }
}
