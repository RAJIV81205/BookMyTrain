import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function parseTrainLiveHTML(html: string) {
  const $ = cheerio.load(html);

  // Extract train number and name from the blue header panel
  const trainHeader = $(".w3-panel.w3-round.w3-blue h3").first().text().trim();
  const trainMatch = trainHeader.match(/^(\d+)\s+(.+)$/);
  const trainNo = trainMatch ? trainMatch[1] : "";
  const trainName = trainMatch ? trainMatch[2] : "";

  // Extract all available dates from navigation tabs
  const availableDates: string[] = [];
  $("#myTab .nav-link").each((_, el) => {
    const dateText = $(el).text().trim();
    if (dateText) availableDates.push(dateText);
  });

  // Parse each tab pane (each date's journey)
  const runs: any = {};
  $(".tab-pane").each((_, pane) => {
    const $pane = $(pane);
    const paneId = $pane.attr("id");

    // Find corresponding date from tab navigation
    let startDate = "";
    $("#myTab .nav-link").each((_, nav) => {
      if ($(nav).attr("href") === `#${paneId}`) {
        startDate = $(nav).text().trim();
      }
    });

    if (!startDate) return;

    // Extract status and last update information
    const statusNote = $pane.find("h6").first().text().trim();
    const lastUpdateText = $pane.find('font[size="2pt"]').first().text().trim();

    // Parse all station cards
    const stations: any[] = [];
    $pane.find(".w3-card-2").each((_, card) => {
      const $card = $(card);

      // Extract arrival time (left side)
      let scheduledArrival = "";
      let actualArrival = "";
      let arrivalDelay = "";
      const leftTimeContainer = $card.find('.w3-container[style*="float:left"][style*="width:100px"]').first();
      if (leftTimeContainer.length) {
        const schedArrText = leftTimeContainer.find("font").first().text().trim();
        scheduledArrival = schedArrText;

        const arrivalFonts = leftTimeContainer.find("font");
        if (arrivalFonts.length > 1) {
          const actualArrText = $(arrivalFonts[1]).find("b").text().trim();
          actualArrival = actualArrText;
          const arrDelaySpan = $(arrivalFonts[1]).find(".w3-round");
          if (arrDelaySpan.length) {
            arrivalDelay = arrDelaySpan.text().trim();
          }
        }
      }

      // Extract station info (middle section)
      let stationCode = "";
      let stationName = "";
      let platform = "";
      let distance = "";
      const middleContainer = $card.find('.w3-container[style*="float:right"][style*="flex:1"]').first();
      if (middleContainer.length) {
        const stationNameBold = middleContainer.find("b").first();
        if (stationNameBold.length) {
          stationName = stationNameBold.text().trim();
        }

        const innerDiv = middleContainer.find('.w3-container[style*="text-align: center"]');
        if (innerDiv.length) {
          const innerText = innerDiv.text();
          const codeMatch = innerText.match(/([A-Z]{2,5})\s+/);
          if (codeMatch) {
            stationCode = codeMatch[1].trim();
          }

          const pfSpan = innerDiv.find(".w3-orange");
          if (pfSpan.length) {
            const pfText = pfSpan.text().trim();
            const pfMatch = pfText.match(/PF\s+(\d+)/i);
            if (pfMatch) {
              platform = pfMatch[1];
            }
          }
        }

        const distMatch = middleContainer.html() && middleContainer.html()!.match(/<b>(\d+)<\/b>\s*KMs/i);
        if (distMatch) {
          distance = distMatch[1];
        }
      }

      // Extract departure time (right side)
      let scheduledDeparture = "";
      let actualDeparture = "";
      let departureDelay = "";
      const rightTimeContainer = $card.find('.w3-container[style*="float:right"][style*="text-align:right"][style*="width:100px"]').first();
      if (rightTimeContainer.length) {
        const schedDepText = rightTimeContainer.find("font").first().text().trim();
        scheduledDeparture = schedDepText;

        const departureFonts = rightTimeContainer.find("font");
        if (departureFonts.length > 1) {
          const actualDepText = $(departureFonts[1]).find("b").text().trim();
          actualDeparture = actualDepText;
          const depDelaySpan = $(departureFonts[1]).find(".w3-round");
          if (depDelaySpan.length) {
            departureDelay = depDelaySpan.text().trim();
          }
        }
      }

      // Extract coach position information
      const coachPosition: any[] = [];
      const modalButton = $card.find('[data-bs-toggle="modal"]');
      if (modalButton.length) {
        const modalId = modalButton.attr("data-bs-target");
        if (modalId) {
          const modal = $(modalId);
          const modalBody = modal.find(".modal-body");
          if (modalBody.length) {
            modalBody.find('div[style*="display:inline-block"]').each((_, coachDiv) => {
              const $coachDiv = $(coachDiv);
              const coachType = $coachDiv.find("div").first().text().trim();
              const coachNumber = $coachDiv.find("div b").text().trim();
              const position = $coachDiv.find("div").last().text().trim();
              if (coachType && position && !position.includes("Divyangjan")) {
                coachPosition.push({
                  type: coachType,
                  number: coachNumber || coachType,
                  position: position,
                });
              }
            });
          }
        }
      }

      // Only add station if we have valid data
      if (stationCode || stationName || scheduledArrival || scheduledDeparture) {
        stations.push({
          stationCode,
          stationName,
          platform,
          distanceKm: distance,
          arrival: {
            scheduled: scheduledArrival,
            actual: actualArrival,
            delay: arrivalDelay,
          },
          departure: {
            scheduled: scheduledDeparture,
            actual: actualDeparture,
            delay: departureDelay,
          },
          coachPosition,
        });
      }
    });

    runs[startDate] = {
      statusNote,
      lastUpdate: lastUpdateText,
      totalStations: stations.length,
      stations,
    };
  });

  // Filter runs to only include those with maximum totalStations (active runs)
  const stationCounts = Object.values(runs).map((run: any) => run.totalStations);
  const maxStations = Math.max(...stationCounts);

  const filteredRuns: any = {};
  Object.entries(runs).forEach(([date, run]: [string, any]) => {
    if (run.totalStations === maxStations) {
      filteredRuns[date] = run;
    }
  });

  return {
    trainNo,
    trainName,
    availableDates,
    totalRuns: Object.keys(filteredRuns).length,
    runs: filteredRuns,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainNumber = searchParams.get("trainNumber");

    if (!trainNumber) {
      return NextResponse.json(
        { error: "Train number is required" },
        { status: 400 }
      );
    }

    // Use today's date by default
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "-");

    // Fetch from Indian Railway API
    const formData = new URLSearchParams();
    formData.append("jDate", formattedDate);
    formData.append("trainNo", trainNumber);

    const response = await fetch(
      "https://enquiry.indianrail.gov.in/mntes/tr?opt=TrainRunning&subOpt=FindRunningInstance",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Parse the HTML response
    const parsedData = parseTrainLiveHTML(html);

    return NextResponse.json(parsedData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
