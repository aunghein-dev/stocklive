import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { mainCachedEvening } from './repo/cachedEveningRepo.js';
import { mainCachedMorning } from './repo/cachedMorningRepo.js';
import {loadHolidays, holidays} from './service/set-holidays-api.js';

let mainNumberElement = document.querySelector('.js-main-number');
let finishedDateTime = '';

let isLiveActive = false; // Track if live data is available
let lastUpdatedTime = null; // Store the last known API update time
let isHoliday = false;


let fetchMainInterval = null;
let fetchNewInterval = null;
let clockInterval = null;



// Function to update the UI with the current system time (local time)
function updateClock() {
  

  if (isLiveActive) {
    let now = new Date();

    // Format: YYYY-MM-DD HH:MM:SS (Local Time)
    let formattedTime = now.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Ensure 24-hour format
    }).replace(",", ""); // Remove comma in some locales

    renderClockLive(formattedTime);
  }
  
}

function renderClockLive(formattedTime) {
  let container = document.querySelector(".updated-time-container");
  let existingIcon = container.querySelector("img");

  // Check if the existing image is the specific "light-live.svg"
  if (!existingIcon || !existingIcon.src.includes("icons/light-live.svg")) {
    let icon = document.createElement("img");
    icon.src = "icons/light-live.svg";
    container.replaceChildren(icon, document.createTextNode(` Updating at ${formattedTime}`));
  } else {
    // Only update the text, keep the existing correct icon
    container.lastChild.textContent = ` Updating at ${formattedTime}`;
  }
}


async function isLiveTime() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    if (data.holiday.status === "2") {
      let now = new Date();
      let morningStart = new Date();
      morningStart.setHours(9, 0, 0, 0);

      let morningEnd = new Date();
      morningEnd.setHours(12, 1, 0, 999);

      let eveningStart = new Date();
      eveningStart.setHours(13, 40, 0, 0);

      let eveningEnd = new Date();
      eveningEnd.setHours(16, 30, 0, 999);

      isLiveActive =
        (now >= morningStart && now <= morningEnd) ||
        (now >= eveningStart && now < eveningEnd);

      isHoliday = false;
    } else if (data.holiday.status === "3") {
      isHoliday = true;
    }

    return isLiveActive;
  } catch (error) {
    console.error("❌ Error fetching live data:", error);
    return null;
  }
}



async function startLiveFetch() {
  const live = await isLiveTime();

  if (live) {

    // Start only if not already running
    if (!fetchMainInterval) {
      fetchMainNumber(); // Fetch immediately
      fetchMainInterval = setInterval(fetchMainNumber, 500);
      console.log("✅ fetchMainNumber started.");

      localStorage.removeItem('cached-morning');
      localStorage.removeItem('cached-evening');
    }

    if (!fetchNewInterval) {
      fetchNewNumber(); // Fetch immediately
      fetchNewInterval = setInterval(fetchNewNumber, 500);
      console.log("✅ fetchNewNumber started.");
    }

    if (!clockInterval) {

      updateClock(); // Update immediately
      clockInterval = setInterval(updateClock, 500);
      console.log("✅ updateClock started.");
    }


  }
}


async function stopLiveFetch() {

  renderingResultNormal();


  if (fetchMainInterval) {
    clearInterval(fetchMainInterval);
    fetchMainInterval = null;
    console.log("❌ fetchMainNumber stopped.");
  }

  if (fetchNewInterval) {
    clearInterval(fetchNewInterval);
    fetchNewInterval = null;
    console.log("❌ fetchNewNumber stopped.");
  }

  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
    console.log("❌ updateClock stopped.");
  }
}



async function checkLiveStatus() {

  const live = await isLiveTime();

  if (live && !fetchMainInterval) {
    startLiveFetch();
    renderMainNumber();
    
  } else if (!live && fetchMainInterval) {
    stopLiveFetch();
  }

  setTimeout(checkLiveStatus, 1000); // Check every second recursively
}

checkLiveStatus(); // Start the live status check

async function fetchNewNumber() {
  try {
    const response = await fetch(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Prevent caching
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    let newSet = data.live.set;
    let newValue = data.live.value;

    // Apply fade-in and fade-out effect based on time
    const currentHour = new Date().getHours();

    if (currentHour <= 12) {
      updateWithFade(".js-morning-set-result", newSet);
      updateWithFade(".js-morning-value-result", newValue);
      updateWithFade(".js-morning-result-digit", "--");
    } else if (currentHour >= 13) {
      updateWithFade(".js-evening-set-result", newSet);
      updateWithFade(".js-evening-value-result", newValue);
      updateWithFade(".js-evening-result-digit", "--");
    }


  } catch (error) {
    console.error("Error fetching data:", error);
    showLoading();
  }
}

// Function to apply fade-in and fade-out effect when updating elements
function updateWithFade(selector, newValue) {
  let element = document.querySelector(selector);
  if (element && element.textContent !== newValue) {
    element.style.opacity = "0"; // Fade out
    setTimeout(() => {
      element.textContent = newValue; // Change text
      element.style.opacity = "1"; // Fade in
    }, 300); // Wait for fade-out before updating (300ms)
  }
}

// Function to show loading state if there's no internet or API error
function showLoading() {
  document.querySelector(".js-morning-set-result").textContent = "--";
  document.querySelector(".js-morning-value-result").textContent = "--";
  document.querySelector(".js-morning-result-digit").textContent = "--";
}

// Initial call to display loading on page load
showLoading();


async function fetchFinishedTime() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      console.error("❌ No valid 'result' array in response");
      return "";
    }

    // Filter valid results with a non-null history_id and exclude specified open times
    const validResults = data.result.filter(item =>
      item.history_id !== null && item.open_time !== "11:00:00" && item.open_time !== "15:00:00"
    );

    if (validResults.length === 0) {
      console.warn("⚠️ No valid finished stock data found.");
      return "";
    }

    // Find the latest stock_datetime from filtered results
    validResults.sort((a, b) => new Date(b.stock_datetime) - new Date(a.stock_datetime));
    
    return validResults[0].stock_datetime;

  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return "";
  }
}


async function fetchFinishedResults() {
  try {
    const response = await fetch("https://api.thaistock2d.com/2d_result");
    const data = await response.json();

    const lastData = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!isHoliday) {
      // Ensure we return valid lastData when the date matches
      if (lastData && lastData.date === new Date().toISOString().split("T")[0]) {
        return lastData ;
      } else {
        return {};
      }
    } else {
      return  {};
    }

    
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Return null on failure to avoid confusion
  }
}



let holidaysArr = [];

function loadHolidaysArr(){
  if (!JSON.parse(localStorage.getItem("cachedSetHolidays"))){
    loadHolidays();
  }
  let holidays = JSON.parse(localStorage.getItem("cachedSetHolidays")) || [];
  holidays
   .forEach(holiday => {
     holidaysArr.push(holiday.date);
   })
}

loadHolidaysArr();

async function renderingShowingLastResults() {

  let now = new Date();

  let morningStart = new Date();
  morningStart.setHours(9, 0, 0, 0);

  let morningEnd = new Date();
  morningEnd.setHours(12, 1, 0, 999);

  let eveningStart = new Date();
  eveningStart.setHours(13, 40, 0, 0);

  let eveningEnd = new Date();
  eveningEnd.setHours(16, 30, 0, 999);

  try {
    let finishedResults = await fetchFinishedResults();
    finishedDateTime = await fetchFinishedTime(); // Get the latest stock_datetime

    let updatedTimeContainer = document.querySelector(".updated-time-container");
    if (!finishedResults || !Array.isArray(finishedResults.child)) {
      console.log("No valid data available.");
      return;
    }


    if(holidaysArr.includes(dayjs().format("YYYY-MM-DD"))){
      renderMorningInPage('--', '--', '--');
      renderEveningInPage('--', '--', '--');
      mainNumberElement.innerHTML = "--";
      updatedTimeContainer.innerHTML = `No data available...`;
    } else {

          //IN !HOLIDAY 
        if (now < morningStart) {
          renderMorningInPage(finishedResults.child[1].set, finishedResults.child[1].value, finishedResults.child[1].twod);
          renderEveningInPage(finishedResults.child[3].set, finishedResults.child[3].value, finishedResults.child[3].twod);
          if (mainNumberElement.innerHTML !== "--") {
            updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 16:30:01")}`;
          } else {
             updatedTimeContainer.innerHTML = `waiting...`;
          }
        }

        if (now > morningStart && now < morningEnd) {
          renderEveningInPage('--', '--', '--');
        }

        if (now > morningEnd && now < eveningStart || now > eveningStart && now < eveningEnd) {
          if (finishedResults.child[1]) {
            renderMorningInPage(finishedResults.child[1].set, finishedResults.child[1].value, finishedResults.child[1].twod);
          } else {
            renderMorningInPage(mainCachedMorning.set, mainCachedMorning.value, mainCachedMorning.twod);
          }
        }


        if (now > eveningEnd) {
          if (finishedResults.child[3]) {
            renderEveningInPage(finishedResults.child[3].set, finishedResults.child[3].value, finishedResults.child[3].twod);
          } else {
            renderEveningInPage(mainCachedEvening.set, mainCachedEvening.value, mainCachedEvening.twod);
          }

          if (finishedResults.child[1]) {
            renderMorningInPage(finishedResults.child[1].set, finishedResults.child[1].value, finishedResults.child[1].twod);
          } else {
            renderMorningInPage(mainCachedMorning.set, mainCachedMorning.value, mainCachedMorning.twod);
          }

        }

          if(now > eveningEnd){
            updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 16:30:01")}`;

            if (finishedResults.child[3]) {
              mainNumberElement.innerHTML = finishedResults.child[3].twod;
            } else {
              mainNumberElement.innerHTML = mainCachedEvening.twod;
            }

            console.log("here in evening");
            
          } else if (now > morningEnd && now < eveningStart){
            updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 12:01:01")}`;
            if (finishedResults.child[1]) {
              mainNumberElement.innerHTML = finishedResults.child[1].twod;
            } else {
              mainNumberElement.innerHTML = mainCachedMorning.twod;
            }

            console.log("here in morning");
          } else if (mainNumberElement.innerHTML === "--" && !isLiveActive) {
            updatedTimeContainer.innerHTML = `No data available...`;
          }  else if (mainNumberElement.innerHTML !== "--" && now > morningEnd) {
            updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 12:01:01")}`;
          } 
        
    }
  } catch (error) {
    console.error("Error fetching finished results:", error);
  }
}


function renderingResultNormal() {
  const now = new Date();
  const currentHour = now.getHours();
  let updatedTimeContainer = document.querySelector(".updated-time-container");

  if (currentHour >= 12 && currentHour < 16) {
    document.querySelector('.js-morning-result-digit').textContent = mainNumberElement.textContent;
    updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 12:01:01")}`;
  }

  if (currentHour >= 16) {
    document.querySelector('.js-evening-result-digit').textContent = mainNumberElement.textContent;
    updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${dayjs().format("YYYY-MM-DD 16:30:01")}`;
  }


  if (currentHour === 12) {
    mainNumberElement.innerHTML = mainCachedMorning.twod;
  } else {
    mainNumberElement.innerHTML = mainCachedEvening.twod;
  }

}



// ✅ Render Evening Result
function renderEveningInPage(itemSet, itemValue, itemTwod) {
  document.querySelector('.js-evening-set-result').textContent = itemSet;
  document.querySelector('.js-evening-value-result').textContent = itemValue;
  document.querySelector('.js-evening-result-digit').textContent = itemTwod;
  if (!isLiveActive) {
    document.querySelector('.main-number').innerHTML = itemTwod;
  }
}

// ✅ Render Morning Result
function renderMorningInPage(itemSet, itemValue, itemTwod) {
  document.querySelector('.js-morning-set-result').textContent = itemSet;
  document.querySelector('.js-morning-value-result').textContent = itemValue;
  document.querySelector('.js-morning-result-digit').textContent = itemTwod;
  if (!isLiveActive) {
    document.querySelector('.main-number').innerHTML = itemTwod;
  }

}


renderingShowingLastResults();



// ✅ Fetch and update main number
async function fetchMainNumber() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    let newNumber = data.live.twod;

    return newNumber;

  } catch (error) {
    console.error("Error fetching data:", error);
    return "--";
  }
}


let intervalId;

async function renderMainNumber() {
  let currentNumber = ""; // Start with "00"

  intervalId = setInterval(async () => {
    if (!isLiveActive) {
      clearInterval(intervalId);  // Stop immediately if isLiveActive is false
      return;
    }
    const newNumber = await fetchMainNumber();

    mainNumberElement.innerHTML = ""; // Clear previous digits

    for (let i = 0; i < 2; i++) {
      const digitSpan = document.createElement("span");
      digitSpan.textContent = newNumber[i];
      digitSpan.classList.add("digit");

      // Apply animation only if live data is active
      if (isLiveActive && newNumber[i] !== currentNumber[i]) {
        digitSpan.classList.add("slide-in");
      }

      mainNumberElement.appendChild(digitSpan);
    }

    currentNumber = newNumber; // Update stored number
  }, 1000); // Change every 1 second
}



