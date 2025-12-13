import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      trainNo,
      dateOfJourney,
      travelClass,
      quota,
      source,
      destination,
    } = await request.json();

    if (
      !trainNo ||
      !dateOfJourney ||
      !travelClass ||
      !quota ||
      !source ||
      !destination
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    /**
     * -------------------------
     * Build ConfirmTKT URL
     * -------------------------
     */
    const url = new URL(
      "https://cttrainsapi.confirmtkt.com/api/v1/availability/fetchAvailability"
    );

    url.searchParams.set("trainNo", trainNo);
    url.searchParams.set("travelClass", travelClass);
    url.searchParams.set("quota", quota);
    url.searchParams.set("sourceStationCode", source);
    url.searchParams.set("destinationStationCode", destination);
    url.searchParams.set("dateOfJourney", dateOfJourney);
    url.searchParams.set("enableTG", "true");
    url.searchParams.set("tGPlan", "CTG-A9");
    url.searchParams.set("showTGPrediction", "false");
    url.searchParams.set("tgColor", "DEFAULT");
    url.searchParams.set("showPredictionGlobal", "true");
    url.searchParams.set("showNewMealOptions", "true");
    url.searchParams.set("showNewAlternates", "true");
    url.searchParams.set("showNewAltText", "true");

    /**
     * -------------------------
     * Fetch Availability
     * -------------------------
     */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-IN,en;q=0.9",
        ApiKey: "ct-mweb!2$",
        ClientId: "ct-mweb",
        "Content-Type": "application/json",
        Origin: "https://www.confirmtkt.com",
        Referer: "https://www.confirmtkt.com/",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch availability" },
        { status: response.status }
      );
    }

    const raw = await response.json();
    const d = raw?.data;

    if (!d) {
      console.log(raw)
      return NextResponse.json(
        { success: false, error: raw?.error?.message || "Invalid API Response"},
        { status: 500 }
      );
    }

    /**
     * -------------------------
     * 🔥 DATA EXTRACTION (INLINE)
     * -------------------------
     */
    const extractedData = {
      train: {
        trainNo: d.trainNo,
        trainName: d.trainName,
        from: d.from,
        to: d.to,
        fromStationName: d.fromStationName,
        toStationName: d.toStationName,
        distance: Number(d.distance),
        travelClass: d.enqClass,
        quota: d.quota,
      },

      fare: {
        baseFare: d.fareInfo?.baseFare ?? 0,
        reservationCharge: d.fareInfo?.reservationCharge ?? 0,
        superfastCharge: d.fareInfo?.superfastCharge ?? 0,
        serviceTax: d.fareInfo?.serviceTax ?? 0,
        totalFare: d.fareInfo?.totalFare ?? 0,
      },

      availability: Array.isArray(d.avlDayList)
        ? d.avlDayList.map((day: any) => ({
            date: day.availablityDate,
            status:
              day.availablityType === "1" ? "AVAILABLE" : "WAITLIST",
            availabilityText: day.availabilityDisplayName,
            rawStatus: day.availablityStatus,
            prediction: day.prediction || null,
            predictionPercentage: Number(day.predictionPercentage || 0),
            canBook: day.enableBookButton,
          }))
        : [],

    };

    /**
     * -------------------------
     * Final Response
     * -------------------------
     */
    return NextResponse.json(
      {
        success: true,
        data: extractedData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Request timed out" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
