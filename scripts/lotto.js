import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
const lottoHTML = document.querySelector('.lotto-wrapper');

let maxYear;
let lottoData = []; // Global variable to store the fetched data

async function fetchLottoData() {
  addingLoadingPage('.loading-page');
    lottoData = await lottoResultService();
    if (!Array.isArray(lottoData) || lottoData.length === 0) {
        console.log("No valid data available.");
        lottoData = []; // Ensure it's always an array
    }
    removeLoadingPage('.loading-page');
      // Remove background color after loading is done
  document.querySelectorAll('.loading-page, .loading-page-title, .loading-page-table')
  .forEach(el => {
    el.style.backgroundColor = 'transparent'; // Remove background color
    el.style.opacity = '0'; // Optional: Fade out effect
  });
    renderLottoForAllYears(); // Call this AFTER data is fetched
}

async function addingLoadingPage(querySelector) {
    document.querySelector(querySelector).innerHTML = 
    `<img src="../icons/loading.svg" />
     loading...`;
}

function removeLoadingPage(querySelector) {
  document.querySelector(querySelector).innerHTML = '';
}


function getYearBoxHTML(year, htmlText) {
  return `<div class="year-box">
          <div class="year-title">${year}</div>
          <div class="container-warapper">
          ${htmlText}
          </div>
          </div>`;
}

function renderLottoForAllYears() {
  let yearBoxHTML = "";

  let uniqueYears = new Set();

  // Collect unique years
  for (let i = 0; i < lottoData.length; i++) {
      uniqueYears.add(dayjs(lottoData[i].for_date_time_Str).year());
  }
  

  // Sort years in descending order
  let sortedYears = [...uniqueYears].sort((a, b) => b - a);

  // Loop through each unique year
  sortedYears.forEach(lottoYear => {
      let lottoContainerHTML = "";
      let previousFirstPrize = null; // Store previous first prize

      // Loop through lottoData (latest first)
      for (let i = lottoData.length - 1; i >= 0; i--) {
         
          let year = dayjs(lottoData[i].for_date_time_Str).year();
      
          if (lottoYear === year) { // Match the current year
              let firstPrize = lottoData[i].firstPrize || ""; // Ensure it's a string
              let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

              let isDuplicate = previousFirstPrize === firstPrize;

              lottoContainerHTML = 
              `<div class="lotto-container">
                  <div class="lotto-draw-info">
                      <div class="lotto-day">${dayjs(lottoData[i].for_date_time_Str).format("D")}</div>
                      <div class="lotto-month">${dayjs(lottoData[i].for_date_time_Str).format("MMMM")}</div>
                  </div>
                  <div class="myan-3d">
                      <div class="lotto-inner-header">3D</div>
                      <div class="myan-3d-num myan-3d-num${i}">${lottoData[i].number}</div>
                  </div>
                  
              </div>` + lottoContainerHTML; // Insert at the beginning

              previousFirstPrize = firstPrize; // Store for duplicate check       
          }
      }

      // Add the year box for this year
      yearBoxHTML += getYearBoxHTML(lottoYear, lottoContainerHTML);
  });

  // Append all years' lotto results to the page
  lottoHTML.innerHTML += yearBoxHTML;
}


// Fetch and store the data, then process it
fetchLottoData();



async function lottoResultService() {
    try{
        fetch = await fetch("https://api.lucky2d.com/api/result/GetList3dResult?searchKey=&pageNumber=1&rowsOfPage=100");
        const data = await fetch.json();
        return (data.results);        
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}




