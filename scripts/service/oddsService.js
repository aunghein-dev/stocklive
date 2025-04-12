export const leagueCollection = new Set();
const apiUrl =
  "https://www.realty88.com/_view/MOddsGen2.ashx?ot=t&update=true&r=1392804364&ov=0&mt=0&LID=&_=1744002123285";

const proxyUrl = "https://api.allorigins.win/get?url=";

async function fetchAndProcessData(apiUrl) {
  try {
    const fullUrl = proxyUrl + encodeURIComponent(apiUrl);
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
  const result = await fetchAndProcessData(apiUrl);
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
