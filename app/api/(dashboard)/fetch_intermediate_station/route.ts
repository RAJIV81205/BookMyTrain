import { NextResponse } from "next/server";




// ----------------------------------------------------
// Extract main route array (myStnsF)
// ----------------------------------------------------
function extractMyStnsF(html: string): string[] {
  const regex = /var\s+myStnsF\s*=\s*\[([\s\S]*?)\]/;
  const match = html.match(regex);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.replace(/["']/g, "").trim())
    .filter((s) => s.length > 0);
}


// ----------------------------------------------------
// Main NTES route fetcher
// ----------------------------------------------------
async function fetchNtesRoute(trainNo:string, jStation:string,jDate:string) {
  const url = `https://enquiry.indianrail.gov.in/mntes/TrnMap?opt=map&subOpt=spot&trainNo=${trainNo}&jStation=${jStation}&jDate=${jDate}&arrDepFlag=D&from=N`;

  const headers = {
    "Cookie": "SERVERID=ccsrww87sfs1; TS012f81d3=01ee28b44494e0766c840b581580a5d4c35121d0d267b86b0af1019c9770a42ad8656fd76523245b91d8d17ee4de89797936135df7",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "https://enquiry.indianrail.gov.in/mntes/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Sec-GPC": "1",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua": "\"Brave\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "accept-language": "en-IN,en;q=0.5",
    "priority": "i",
    "referer": "https://enquiry.indianrail.gov.in/",
    "sec-fetch-dest": "image",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "cross-site",
    "sec-fetch-storage-access": "none",
    "sec-gpc": "1",
    "if-modified-since": "Fri, 20 Jun 2025 10:33:48 GMT",
  };

  const body = new URLSearchParams({
    lan: "en",
    jDate: jDate,
    trainNo: trainNo,
    "-tfoh8rd6i2571768284550": "-71qm7iqhy5sn29471409"
  }).toString();

  const res = await fetch(url, {
    method: "POST",
    headers,
    body
  });

  const html = await res.text();
  return html;
}

// ----------------------------------------------------
// NEXT.JS API ROUTE
// ----------------------------------------------------
export async function POST(req: Request) {
  try {
    const { trainNo, jStation , jDate } = await req.json();

    if (!trainNo || !jStation || trainNo.length !== 5 || !jDate) {
      return NextResponse.json(
        { error: "Missing or invalid trainNo / jStation" },
        { status: 400 }
      );
    }

    const result = await fetchNtesRoute(trainNo, jStation , jDate);
    const myStnsF = extractMyStnsF(result);

    return NextResponse.json(
        { myStnsF },
        { status: 200 }
      
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "NTES route fetch failed" },
      { status: 500 }
    );
  }
}
