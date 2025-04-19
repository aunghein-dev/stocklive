import { fetchOddsData, formatOdds } from "./service/oddsService.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

// Show loading spinner
document.querySelector('.js-loading-container').classList.add('active');
document.querySelector('.js-header-tag').innerHTML = `Myanmar ဘော်ဒီ၊ ဂိုးပေါင်း (${dayjs().format('DD-MMM-YYYY')})`;

fetchOddsData()
  .then(data => {
    const leagueMap = new Map();
   
    if(data.length === 0) {
      document.querySelector('.no-match-view-text').innerHTML = 'ပွဲစဉ်မရှိသေးပါ (သို့) Refreshလုပ်ပါ...';
      document.querySelector('.js-view-root').innerHTML = '';
    } else {

      // Build league map with match rows
      data.forEach(eachMatch => {
        const league = eachMatch.league || "Unknown League";
        const valG = eachMatch[51] / 100;
        const formatVal = valG >= 0 ? `+${valG}` : valG;
        const finalGP = `${eachMatch[55]}${formatVal}` === '0-0.01' ? '' : `${eachMatch[55]}${formatVal}`;

        const spanHighLight = eachMatch[34] === 1 ? eachMatch[16] : eachMatch[20];

        const checkHome = spanHighLight === eachMatch[16]
          ? `<span class="highlight">${eachMatch[16]}</span>`
          : `<span>${eachMatch[16]}</span>`;

        const checkAway = spanHighLight === eachMatch[20]
          ? `<span class="highlight">${eachMatch[20]}</span>`
          : `<span>${eachMatch[20]}</span>`;

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

      // Create fragment for faster rendering
      const container = document.querySelector('.js-odds-body');
      container.innerHTML = ''; // Clear previous content

      const fragment = document.createDocumentFragment();
      [...leagueMap.entries()].slice(0, 7).forEach(([leagueName, rows]) => {
        const groupRow = document.createElement('tr');
        groupRow.className = 'match-group-header';
        groupRow.style.backgroundColor = 'var(--header-box-month)';
        groupRow.innerHTML = `<td colspan="6">${leagueName}</td>`;
        fragment.appendChild(groupRow);

        rows.forEach(rowHTML => {
          const row = document.createElement('tr');
          row.innerHTML = rowHTML.trim().replace(/^<tr>|<\/tr>$/g, ''); // Remove outer <tr> if exists
          fragment.appendChild(row);
        });
      });

      container.appendChild(fragment);
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

// Your original time adjust function
function subtract90Minutes(timeStr) {
  const normalized = timeStr.replace(/(AM|PM)/, ' $1').trim();

  const [time, period] = normalized.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  let totalMinutes = hour * 60 + minute;
  totalMinutes -= 90;
  if (totalMinutes < 0) totalMinutes += 1440;

  let newHour = Math.floor(totalMinutes / 60);
  let newMinute = totalMinutes % 60;

  const newPeriod = newHour >= 12 ? 'PM' : 'AM';
  newHour = newHour % 12;
  if (newHour === 0) newHour = 12;

  return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}${newPeriod}`;
}

