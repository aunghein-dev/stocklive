/*export const leagueCollection = new Set();
const apiUrlBase =
  "https://www.realty88.com/_view/MOddsGen2.ashx?ot=t&update=true&r=1392804364&ov=0&mt=0&LID=";

const proxyUrl = "https://api.allorigins.win/get?url=";

// Function to add cache busting
function addCacheBusting(url) {
  const timestamp = new Date().getTime();
  return `${url}&_=${timestamp}`;
}

async function fetchAndProcessData(apiUrl) {
  try {
    const fullUrl = proxyUrl + encodeURIComponent(addCacheBusting(apiUrl)); // Add cache-busting to the apiUrl
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch from API proxy.");
    }

    const proxyData = await response.json();

    // Get the raw text response inside "contents"
    const rawText = proxyData.contents;

    // Clean up bad JSON (e.g., single quotes instead of double quotes)
    const cleaned = rawText.replace(/'/g, '"');

    // Parse cleaned JSON safely
    const parsed = JSON.parse(cleaned);

    return parsed[3]; // Adjust this if the structure changes
  } catch (error) {
    console.error("API Fetching/Parsing Error:", error.message);
    return [];
  }
}

export async function fetchOddsData() {
  const result = await fetchAndProcessData(apiUrlBase);
  const uniqueMatchIds = new Set();
  const finalArr = [];

  result.forEach(([leagueMeta, matches]) => {
    matches.forEach(match => {
      match.league = leagueMeta[1]; // Attach league name

      const matchId = match[3];
      if (!uniqueMatchIds.has(matchId)) {
        uniqueMatchIds.add(matchId);
        finalArr.push(match);
      }

      if (!leagueCollection.has(match.league)) {
        leagueCollection.add(match.league);
      }
    });
  });

  return finalArr;
}

export function formatOdds(num1, num2) {
  const val = num2 / 100;
  const formatted = `${num1}${val > 0 ? `+${val}` : val === -0.01 ? '' : val}`;
  return formatted === '0-0.01' ? '' : formatted;
}
*/



export const leagueCollection = new Set();

// Base API (LID value will be appended)
const apiUrlBase =
  "https://www.realty88.com/_view/MOddsGen2.ashx?ot=t&update=true&r=1392804364&ov=0&mt=0&LID=";

// ✅ Your custom Google Apps Script proxy URL
const proxyUrl =
  "https://script.google.com/macros/s/AKfycbwHH9rJaXiQrBPDyPtRCgO0a2488gjDy_U_b1bZTOL2CfXM9vHNzjqxypOBQQZApLBr/exec?url=";

// Add timestamp to prevent cache
function addCacheBusting(url) {
  const timestamp = new Date().getTime();
  return `${url}&_=${timestamp}`;
}

// Main function to fetch and parse the API
async function fetchAndProcessData(apiUrl) {
  try {
    const fullUrl = proxyUrl + encodeURIComponent(addCacheBusting(apiUrl));
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch from Google Apps Script proxy.");
    }

    const rawText = await response.text();

    // Optional: Fix single quotes or malformed JSON if needed
    const cleaned = rawText.replace(/'/g, '"');

    const parsed = JSON.parse(cleaned);

    return parsed[3]; // Adjust index if structure changes
  } catch (error) {
    console.error("API Fetching/Parsing Error:", error.message);
    return [];
  }
}

// Wrapper to get and organize match data
export async function fetchOddsData(lid = 1) {
  const result = await fetchAndProcessData(apiUrlBase + lid);
  const uniqueMatchIds = new Set();
  const finalArr = [];

  result.forEach(([leagueMeta, matches]) => {
    matches.forEach(match => {
      match.league = leagueMeta[1]; // League name

      const matchId = match[3];
      if (!uniqueMatchIds.has(matchId)) {
        uniqueMatchIds.add(matchId);
        finalArr.push(match);
      }

      if (!leagueCollection.has(match.league)) {
        leagueCollection.add(match.league);
      }
    });
  });

  return finalArr;
}

// Format odds values for display
export function formatOdds(num1, num2) {
  const val = num2 / 100;
  const formatted = `${num1}${val > 0 ? `+${val}` : val === -0.01 ? '' : val}`;
  return formatted === '0-0.01' ? '' : formatted;
}
