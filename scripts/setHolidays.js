import { holidays, loadHolidays } from "./service/set-holidays-api.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

async function renderSetHolidays() {
   addingLoadingPage(); 

   await loadHolidays();

  let uniqMonth = [];
  let months = [];

  holidays.forEach((holiday) => {
    months.push(dayjs(holiday.date).format("MMMM"));
  });

  uniqMonth = [...new Set(months)];

  
  

  let html = "";
  uniqMonth.reverse().forEach((month) => {
    let lastIndex = uniqMonth.length - 1;
    let className = "";
    if (month === uniqMonth[lastIndex]) {
      className = "last-drawing";
    }


    

    html += `
      <div class="holiday-row-container js-holiday-row-container">
        <div class="holiday-month-container">
          <div class="holiday-month">${month}</div>
          <div class="drawing ${className}">
            <div class="drawing-bubble"></div>
            <div class="drawing-line"></div>
          </div>
        </div>

        <div class="right-details-box-section">
          ${generateHolidaysDetailsHTML(month)}
        </div>
      </div>
    `;
  });

  document.querySelector(".js-page-year").innerHTML = new Date().getFullYear();
  document.querySelector(".js-main-content").innerHTML = html;
  removeLoadingPage();

}




function generateHolidaysDetailsHTML(month) {
  const currentYear = dayjs().format("YYYY");

  // Filter and sort holidays for the given month
  const filteredHolidays = holidays
    .filter(holiday =>
      dayjs(holiday.date).format("MMMM") === month &&
      dayjs(holiday.date).format("YYYY") === currentYear
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  let innerHTML = "";

  filteredHolidays.forEach((holiday) => {
    innerHTML += `
      <div class="right-details-row-box">
        <div class="inner-left-box">
          <div class="holiday-date">${dayjs(holiday.date).format("D")}</div>
        </div>
        <div class="inner-right-box">
          <div class="inner-right-row1">${holiday.name}</div>
          <div class="inner-right-row2">${dayjs(holiday.date).format("dddd")}</div>
        </div>
      </div>
    `;
  });

  return innerHTML;
}



 function addingLoadingPage() {
  document.querySelector(".loading-page").innerHTML = `
    <img src="../icons/loading.svg" />
    <p>loading...</p>
  `;
}

 function removeLoadingPage() {
  document.querySelector(".loading-page").innerHTML = "";
  document.querySelector('.js-set-loading').style.display = 'none';
}

// Start rendering with loading effect
renderSetHolidays();
