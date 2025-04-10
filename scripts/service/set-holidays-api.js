export let holidays = JSON.parse(localStorage.getItem("cachedSetHolidays")) || [];

function convertGoogleSheetsDate(serialNumber) {
  const epoch = new Date(1899, 11, 30); // Google Sheets epoch
  return new Date(epoch.getTime() + serialNumber * 86400000);
}

async function fetchSetHolidaysObjects() {
  const sheetId = "1DxmnINRAkdMM-qp4kWWVYMMXoO6xJDh8f1EtBiX_mgk";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    // Remove Google's wrapper and parse JSON
    const jsonData = data.replace("/*O_o*/", "").replace(/google\.visualization\.Query\.setResponse\((.*)\);/, "$1");
    const parsedData = JSON.parse(jsonData);
    const rows = parsedData.table.rows;

    // Process rows
    return rows.map(row => {
      let dateString = row.c[0].v; // Date value from Google Sheets

      // Handle "Date(YYYY,MM,DD)" format
      let match = dateString.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = match[1];
        const month = match[2]; // 0-based (January = 0)
        const day = match[3];

        dateString = `${year}-${(parseInt(month) + 1).toString().padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      return {
        date: dateString, // Proper YYYY-MM-DD format
        name: row.c[1].v, // Holiday name
      };
    });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return [];
  }
}


async function getHolidays() {
  const fetchedHolidays = await fetchSetHolidaysObjects();
  if (fetchedHolidays.length > 0) {
    localStorage.setItem("cachedSetHolidays", JSON.stringify(fetchedHolidays));
    holidays = fetchedHolidays;
  }
}

export async function loadHolidays() {
  if (!localStorage.getItem("cachedSetHolidays")) {
    await getHolidays();
  } else {
    holidays = JSON.parse(localStorage.getItem("cachedSetHolidays"));
  }
}
