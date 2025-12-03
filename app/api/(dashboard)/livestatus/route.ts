import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function parseTrainLiveHTML(html: string) {
  console.log('🔧 [Parser] Starting HTML parsing...');

  try {
    const $ = cheerio.load(html);

    // Extract train number and name from the blue header panel
    const trainHeader = $(".w3-panel.w3-round.w3-blue h3").eq(1).text().trim();

    console.log('🏷️  [Parser] Train Header:', trainHeader);

    const trainMatch = trainHeader.match(/(\d{5})\s+(.+)/);
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

    // Filter runs to only include those that are running or completed (exclude "Yet to start")
    const filteredRuns: any = {};
    Object.entries(runs).forEach(([date, run]: [string, any]) => {
      const isYetToStart = run.statusNote.includes("Yet to start from its source");

      if (!isYetToStart) {
        filteredRuns[date] = run;
        console.log(`  ✅ [Parser] Including run: ${date} - Status: ${run.statusNote}`);
      } else {
        console.log(`  ⏭️  [Parser] Excluding run: ${date} - Status: Yet to start`);
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

function parseTrainLiveHTMLwithDate(html: string, trainDate: string) {
  console.log('🔧 [Parser-Date] Starting HTML parsing for specific date:', trainDate);

  try {
    const $ = cheerio.load(html);

    // Extract train number and name from the blue header panel
    const trainHeader = $(".w3-panel.w3-round.w3-blue h3").eq(1).text().trim();
    console.log('🏷️  [Parser-Date] Train Header:', trainHeader);

    const trainMatch = trainHeader.match(/(\d{5})\s+(.+)/);
    const trainNo = trainMatch ? trainMatch[1] : "";
    const trainName = trainMatch ? trainMatch[2] : "";

    if (!trainNo || !trainName) {
      console.warn('⚠️  [Parser-Date] Warning: Could not extract train number or name from header');
    }

    // Find the specific tab pane for the requested date
    let targetPaneId = "";
    $("#myTab .nav-link").each((_, nav) => {
      const dateText = $(nav).text().trim();
      if (dateText === trainDate) {
        const href = $(nav).attr("href");
        if (href) {
          targetPaneId = href.replace("#", "");
        }
      }
    });

    if (!targetPaneId) {
      console.error('❌ [Parser-Date] Date not found in available tabs:', trainDate);
      throw new Error(`Train data not available for date: ${trainDate}`);
    }

    console.log('📋 [Parser-Date] Found pane ID for date:', targetPaneId);

    // Get the specific tab pane
    const $pane = $(`#${targetPaneId}`);
    if (!$pane.length) {
      console.error('❌ [Parser-Date] Pane not found for ID:', targetPaneId);
      throw new Error(`No data found for date: ${trainDate}`);
    }

    // Extract status and last update information
    const statusNote = $pane.find("h6").first().text().trim();
    const lastUpdateText = $pane.find('font[size="2pt"]').first().text().trim();

    console.log(`  ℹ️  [Parser-Date] Status: ${statusNote}`);
    console.log(`  🕐 [Parser-Date] Last Update: ${lastUpdateText}`);

    // Parse all station cards
    const stations: any[] = [];
    const stationCards = $pane.find(".w3-card-2");
    console.log(`  🚉 [Parser-Date] Found ${stationCards.length} station cards`);

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
        console.warn(`  ⚠️  [Parser-Date] Card ${cardIndex}: Skipped - insufficient data`);
      }
    });

    console.log(`  ✅ [Parser-Date] Parsed ${stations.length} valid stations for ${trainDate}`);

    const result = {
      trainNo,
      trainName,
      date: trainDate,
      statusNote,
      lastUpdate: lastUpdateText,
      totalStations: stations.length,
      stations,
    };

    console.log('✅ [Parser-Date] Parsing completed successfully');
    return result;

  } catch (parseError: any) {
    console.error('❌ [Parser-Date] Error during HTML parsing:', parseError.message);
    console.error('❌ [Parser-Date] Stack:', parseError.stack);
    throw new Error(`Failed to parse train data for date ${trainDate}: ${parseError.message}`);
  }
}

async function generateToken() {
  const t = Date.now();
  const res = await fetch(`https://enquiry.indianrail.gov.in/mntes/GetCSRFToken?t=${t}`, {
    headers: { "x-requested-with": "XMLHttpRequest", "Referer": "https://enquiry.indianrail.gov.in/mntes/" },
  });

  const html = await res.text();
  const cookie = res.headers.get("set-cookie") || "";
  const match = html.match(/name='([^']+)' value='([^']+)'/);

  if (!match) throw new Error("CSRF token not found");

  return {
    cookie,                 // full JSESSIONID + others
    tokenName: match[1],
    tokenValue: match[2],
  };
}



export async function GET(request: Request) {
  const startTime = Date.now();
  console.log('🚂 [LiveStatus API] Request received');

  try {
    const { searchParams } = new URL(request.url);
    const trainNumber = searchParams.get("trainNumber");
    const trainDate = searchParams.get("trainDate") || "";

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
    const { cookie, tokenName, tokenValue } = await generateToken();

    const formData = new URLSearchParams({
      lan: "en",
      jDate: formattedDate,
      trainNo: trainNumber,
      [tokenName]: tokenValue,
    });

    const response = await fetch(
      "https://enquiry.indianrail.gov.in/mntes/tr?opt=TrainRunning&subOpt=FindRunningInstance",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://enquiry.indianrail.gov.in/mntes/",
          "Cookie": cookie,  // attach the same session cookie
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



    // Parse the HTML response
    let parsedData;
    if (trainDate) {
      parsedData = parseTrainLiveHTMLwithDate(html, trainDate);
      console.log(`  📅 ${parsedData.date}: ${parsedData.totalStations} stations`);
    } else {
      parsedData = parseTrainLiveHTML(html);
      // Log station count for each run
      Object.entries(parsedData.runs).forEach(([date, run]: [string, any]) => {
        console.log(`  📅 ${date}: ${run.totalStations} stations`);
      });
    }

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
