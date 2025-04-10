import { fetchOddsData, formatOdds } from "./service/oddsService.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

// Show loading spinner
document.querySelector('.js-loading-container').classList.add('active');
document.querySelector('.js-header-tag').innerHTML = `Myanmar ဘော်ဒီ၊ ဂိုးပေါင်း ပေါက်ကြေး (${dayjs().format('DD/MMM/YYYY')})`;

fetchOddsData()
  .then(data => {
    const leagueMap = new Map();
   
    if(data.length===0){
      document.querySelector('.js-no-match-view').innerHTML = 'ပွဲစဉ်မရှိသေးပါ...';
      document.querySelector('.js-view-root').innerHTML = '';
    } else {

    data.forEach(eachMatch => {
      const league = eachMatch.league || "Unknown League";
      const valG = eachMatch[51] / 100;
      const formatVal = valG >= 0 ? `+${valG}` : valG;
      const finalGP = `${eachMatch[55]}${formatVal}` === '0-0.01' ? '' : `${eachMatch[55]}${formatVal}`;


      // Determine which team is highlighted
      const spanHighLight = eachMatch[34] === 1 ? eachMatch[16] : eachMatch[20];

      const checkHome = spanHighLight === eachMatch[16]
        ? `<span class="highlight">${eachMatch[16]}</span>`
        : `<span>${eachMatch[16]}</span>`;

      const checkAway = spanHighLight === eachMatch[20]
        ? `<span class="highlight">${eachMatch[20]}</span>`
        : `<span>${eachMatch[20]}</span>`;

      // HTML for a match row
      const matchRowHTML = `
        <tr>
          <td class="main-td">${subtract90Minutes(eachMatch[8])}</td>
          <td class="main-td">${checkHome} - ${checkAway}</td>
          <td class="main-td">${formatOdds(eachMatch[52], eachMatch[50])}</td>
          <td class="main-td">${finalGP}</td>
        </tr>
      `;

      if (!leagueMap.has(league)) {
        leagueMap.set(league, []);
      }

      leagueMap.get(league).push(matchRowHTML);
    });

    const container = document.querySelector('.js-odds-body');
    container.innerHTML = ''; // Clear previous content

    // Display only first 7 leagues
    [...leagueMap.entries()].slice(0, 7).forEach(([leagueName, rows]) => {
      const groupHTML = `
        <tr class="match-group-header" style="background-color: var(--header-box-month);">
          <td colspan="6">${leagueName}</td>
        </tr>
      `;
      container.insertAdjacentHTML('beforeend', groupHTML);
      rows.forEach(rowHTML => {
        container.insertAdjacentHTML('beforeend', rowHTML);
      });
    });
  }
  })
  .catch(error => {
    console.error("Error fetching odds data:", error);
    const container = document.querySelector('.js-odds-body');
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;">Failed to load data. Please try again later.</td></tr>`;
  })
  .finally(() => {
    // Hide loading spinner
    document.querySelector('.js-loading-container').classList.remove('active');
  });

  function formatToReadableTime(rawTime) {
    if (!rawTime || typeof rawTime !== 'string') return 'Invalid input';
  
    const normalized = rawTime.replace(/(AM|PM)/, ' $1').trim();
    const parsed = dayjs(normalized, 'hh:mm A');
  
    if (!parsed.isValid()) {
      console.error('Invalid time format:', rawTime);
      return 'Invalid time';
    }
  
    return parsed.format('HH:mm A'); // 24-hour format + space before AM/PM
  }

function subtract90Minutes(timeStr) {
  // Normalize time string (e.g. "03:00AM" → "03:00 AM")
  const normalized = timeStr.replace(/(AM|PM)/, ' $1').trim();

  // Extract hours, minutes, and period
  const [time, period] = normalized.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  // Convert to total minutes
  let totalMinutes = hour * 60 + minute;

  // Subtract 90 minutes
  totalMinutes -= 90;
  if (totalMinutes < 0) totalMinutes += 1440; // wrap around midnight

  // Convert back to hours and minutes
  let newHour = Math.floor(totalMinutes / 60);
  let newMinute = totalMinutes % 60;

  // Determine new period
  const newPeriod = newHour >= 12 ? 'PM' : 'AM';
  newHour = newHour % 12;
  if (newHour === 0) newHour = 12;

  // Format result
  const formattedTime = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}${newPeriod}`;
  return formattedTime;
}
  