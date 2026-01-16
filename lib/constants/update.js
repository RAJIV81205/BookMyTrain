import fs from "fs";

// ⚠️ Replace with your actual paths
const stationsPath = "./stations.json";

const newData = "";
// ----------------------------------------------------
// 1️⃣ Parse the raw data into usable objects
// ----------------------------------------------------

function parseFlatData(data) {
  const arr = data.split(",");
  const results = [];

  for (let i = 0; i < arr.length; i += 5) {
    const code = arr[i]?.trim();
    const name = arr[i + 1]?.trim();
    const lat = parseFloat(arr[i + 3]);
    const lon = parseFloat(arr[i + 4]);

    if (!code) continue;

    results.push({
      stnCode: code,
      stnName: name,
      latitude: lat,
      longitude: lon,
    });
  }

  return results;
}

const updates = parseFlatData(newData);

// ----------------------------------------------------
// 2️⃣ Load existing JSON
// ----------------------------------------------------

const file = JSON.parse(fs.readFileSync(stationsPath, "utf8"));
const stations = file.station;

// ----------------------------------------------------
// 3️⃣ Update OR Insert (if missing)
// ----------------------------------------------------

let updatedCount = 0;
let insertedCount = 0;

updates.forEach((upd) => {
  const existing = stations.find((s) => s.stnCode === upd.stnCode);

  if (existing) {
    // ---- Update existing station ----
    if (!isNaN(upd.latitude)) existing.latitude = upd.latitude;
    if (!isNaN(upd.longitude)) existing.longitude = upd.longitude;
    updatedCount++;
  } else {
    // ---- Insert NEW station ----
    stations.push({
      stnName: upd.stnName || "",
      stnCode: upd.stnCode,
      latitude: upd.latitude,
      longitude: upd.longitude,
      // Minimal fields only
      utterances: [],
      name_hi: "",
      name_gu: "",
      district: "",
      state: "",
      trainCount: "0",
      address: "",
    });
    insertedCount++;
  }
});

// ----------------------------------------------------
// 4️⃣ Save updated file
// ----------------------------------------------------

fs.writeFileSync(stationsPath, JSON.stringify(file, null, 2));

console.log(
  `Updated ${updatedCount} stations, inserted ${insertedCount} new stations successfully!`
);
