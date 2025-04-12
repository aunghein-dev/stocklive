export const leagueCollection = new Set();

const baseApiUrl =
  "https://www.realty88.com/_view/MOddsGen2.ashx?ot=t&update=true&r=1392804364&ov=0&mt=0&LID=";

const proxyUrl = "https://corsproxy.io/?"; // ✅ More reliable proxy

async function fetchAndProcessData() {
  try {
    const ts = Date.now();
    const fullUrl = proxyUrl + encodeURIComponent(`${baseApiUrl}&_=${ts}`);
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch from CORS proxy.");
    }

    const rawText = await response.text(); // CORSProxy returns raw response, not JSON
    const cleaned = rawText.replace(/'/g, '"');

    const parsed = JSON.parse(cleaned);
    return parsed[3];
  } catch (error) {
    console.error("API Fetching/Parsing Error:", error.message);
    return [];
  }
}

export async function fetchOddsData() {
  const result = await fetchAndProcessData();
  const uniqueMatchIds = new Set();
  const finalArr = [];

  result.forEach(([leagueMeta, matches]) => {
    matches.forEach(match => {
      match.league = leagueMeta[1];

      const matchId = match[3];
      if (!uniqueMatchIds.has(matchId)) {
        uniqueMatchIds.add(matchId);
        finalArr.push(match);
      }

      leagueCollection.add(match.league);
    });
  });

  return finalArr;
}

export function formatOdds(num1, num2) {
  const val = num2 / 100;
  const formatted = `${num1}${val > 0 ? `+${val}` : val === -0.01 ? '' : val}`;
  return formatted === '0-0.01' ? '' : formatted;
}
