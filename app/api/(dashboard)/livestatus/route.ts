import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function parseTrainLiveHTML(html: string) {
  console.log('🔧 [Parser] Starting HTML parsing...');
  
  try {
    const $ = cheerio.load(html);

    // Extract train number and name from the blue header panel
    const trainHeader = $(".w3-panel.w3-round.w3-blue h3").first().text().trim();
    console.log('🏷️  [Parser] Train Header:', trainHeader);
    
    const trainMatch = trainHeader.match(/^(\d+)\s+(.+)$/);
    const trainNo = trainMatch ? trainMatch[1] : "";
    const trainName = trainMatch ? trainMatch[2] : "";
    
    if (!trainNo || !trainName) {
      console.warn('⚠️  [Parser] Warning: Could not extract train number or name from header');
    }

    // Extract all available dates from navigation tabs
    const availableDates: string[] = [];
    $("#myTab .nav-link").each((_, el) => {
      const dateText = $(el).text().trim();
      if (dateText) availableDates.push(dateText);
    });
    
    console.log('📅 [Parser] Found', availableDates.length, 'available dates:', availableDates);

    // Parse each tab pane (each date's journey)
    const runs: any = {};
    const tabPanes = $(".tab-pane");
    console.log('📑 [Parser] Found', tabPanes.length, 'tab panes to process');
    
    $(".tab-pane").each((paneIndex, pane) => {
      const $pane = $(pane);
      const paneId = $pane.attr("id");

      // Find corresponding date from tab navigation
      let startDate = "";
      $("#myTab .nav-link").each((_, nav) => {
        if ($(nav).attr("href") === `#${paneId}`) {
          startDate = $(nav).text().trim();
        }
      });

      if (!startDate) {
        console.warn(`⚠️  [Parser] Pane ${paneIndex}: No date found for pane ID: ${paneId}`);
        return;
      }
      
      console.log(`📋 [Parser] Processing pane ${paneIndex + 1}/${tabPanes.length} - Date: ${startDate}`);

      // Extract status and last update information
      const statusNote = $pane.find("h6").first().text().trim();
      const lastUpdateText = $pane.find('font[size="2pt"]').first().text().trim();
      
      console.log(`  ℹ️  [Parser] Status: ${statusNote}`);
      console.log(`  🕐 [Parser] Last Update: ${lastUpdateText}`);

      // Parse all station cards
      const stations: any[] = [];
      const stationCards = $pane.find(".w3-card-2");
      console.log(`  🚉 [Parser] Found ${stationCards.length} station cards`);
      
      $pane.find(".w3-card-2").each((cardIndex, card) => {
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
        } else {
          console.warn(`  ⚠️  [Parser] Card ${cardIndex}: Skipped - insufficient data`);
        }
      });

      console.log(`  ✅ [Parser] Parsed ${stations.length} valid stations for ${startDate}`);

      runs[startDate] = {
        statusNote,
        lastUpdate: lastUpdateText,
        totalStations: stations.length,
        stations,
      };
    });

    console.log('📊 [Parser] Total runs parsed:', Object.keys(runs).length);

    // Filter runs to only include those with maximum totalStations (active runs)
    const stationCounts = Object.values(runs).map((run: any) => run.totalStations);
    const maxStations = Math.max(...stationCounts);
    
    console.log('🔍 [Parser] Station counts per run:', stationCounts);
    console.log('📈 [Parser] Maximum stations:', maxStations);

    const filteredRuns: any = {};
    Object.entries(runs).forEach(([date, run]: [string, any]) => {
      if (run.totalStations === maxStations) {
        filteredRuns[date] = run;
        console.log(`  ✅ [Parser] Including run: ${date} (${run.totalStations} stations)`);
      } else {
        console.log(`  ⏭️  [Parser] Excluding run: ${date} (${run.totalStations} stations)`);
      }
    });

    console.log('🎯 [Parser] Final filtered runs:', Object.keys(filteredRuns).length);

    const result = {
      trainNo,
      trainName,
      availableDates,
      totalRuns: Object.keys(filteredRuns).length,
      runs: filteredRuns,
    };

    console.log('✅ [Parser] Parsing completed successfully');
    return result;
    
  } catch (parseError: any) {
    console.error('❌ [Parser] Error during HTML parsing:', parseError.message);
    console.error('❌ [Parser] Stack:', parseError.stack);
    throw new Error(`Failed to parse train data: ${parseError.message}`);
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  console.log('🚂 [LiveStatus API] Request received');

  try {
    const { searchParams } = new URL(request.url);
    const trainNumber = searchParams.get("trainNumber");

    console.log('📋 [LiveStatus API] Train Number:', trainNumber);

    if (!trainNumber) {
      console.error('❌ [LiveStatus API] Error: Train number is missing');
      return NextResponse.json(
        { error: "Train number is required" },
        { status: 400 }
      );
    }

    // Validate train number format (5 digits)
    if (!/^\d{5}$/.test(trainNumber)) {
      console.error('❌ [LiveStatus API] Error: Invalid train number format:', trainNumber);
      return NextResponse.json(
        { error: "Train number must be exactly 5 digits" },
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

    console.log('📅 [LiveStatus API] Formatted Date:', formattedDate);

    // Fetch from Indian Railway API
    const formData = new URLSearchParams();
    formData.append("jDate", formattedDate);
    formData.append("trainNo", trainNumber);

    console.log('🌐 [LiveStatus API] Fetching from Indian Railway API...');
    console.log('📤 [LiveStatus API] Request Body:', formData.toString());

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

    console.log('📥 [LiveStatus API] Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ [LiveStatus API] HTTP Error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('📄 [LiveStatus API] HTML Response Length:', html.length, 'characters');

    // Parse the HTML response
    console.log('🔍 [LiveStatus API] Parsing HTML...');
    const parsedData = parseTrainLiveHTML(html);

    console.log('✅ [LiveStatus API] Parsing Complete');
    console.log('🚆 [LiveStatus API] Train:', parsedData.trainNo, '-', parsedData.trainName);
    console.log('📊 [LiveStatus API] Total Runs:', parsedData.totalRuns);
    console.log('📍 [LiveStatus API] Available Dates:', parsedData.availableDates);

    // Log station count for each run
    Object.entries(parsedData.runs).forEach(([date, run]: [string, any]) => {
      console.log(`  📅 ${date}: ${run.totalStations} stations`);
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  [LiveStatus API] Request completed in ${duration}ms`);

    return NextResponse.json(parsedData, { status: 200 });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [LiveStatus API] Error occurred after', duration, 'ms');
    console.error('❌ [LiveStatus API] Error Type:', err.name);
    console.error('❌ [LiveStatus API] Error Message:', err.message);
    console.error('❌ [LiveStatus API] Error Stack:', err.stack);

    // Provide more specific error messages
    let errorMessage = "Failed to fetch live status";
    let statusCode = 500;

    if (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND')) {
      errorMessage = "Unable to connect to Indian Railway server. Please try again later.";
      statusCode = 503;
      console.error('❌ [LiveStatus API] Network Error: Cannot reach Indian Railway API');
    } else if (err.message.includes('timeout')) {
      errorMessage = "Request timeout. Please try again.";
      statusCode = 504;
      console.error('❌ [LiveStatus API] Timeout Error');
    } else if (err.message.includes('HTTP error')) {
      errorMessage = "Indian Railway server returned an error. Please try again.";
      statusCode = 502;
      console.error('❌ [LiveStatus API] Upstream HTTP Error');
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: statusCode }
    );
  }
}
