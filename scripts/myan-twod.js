import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

const mainNumberElement = document.querySelector('.js-main-number');
const morningSetEl = document.querySelector('.js-morning-set-result');
const morningValueEl = document.querySelector('.js-morning-value-result');
const morningTwodEl = document.querySelector('.js-morning-result-digit');

const eveningSetEl = document.querySelector('.js-evening-set-result');
const eveningValueEl = document.querySelector('.js-evening-value-result');
const eveningTwodEl = document.querySelector('.js-evening-result-digit');
let isLiveActive = false;
let intervalId = null;
let childRenderIntervalId = null;
let timeRenderIntervalId = null;

// Time and day checks
async function isHoliday(){
  const status = await getFullResult();
  return status.holiday.status!=='2';
}

async function isWeekendAndIsHoliday() {
  const day = dayjs().format('ddd');
  return day === 'Sat' || day === 'Sun' || (await isHoliday());
}

function isLiveMorning() {
  const now = dayjs();
  const start = now.hour(9).minute(0).second(0);
  const end = now.hour(12).minute(1).second(0);
  return now.isAfter(start) && now.isBefore(end);
}

function isLiveEvening() {
  const now = dayjs();
  const start = now.hour(13).minute(0).second(0);
  const end = now.hour(16).minute(30).second(0);
  return now.isAfter(start) && now.isBefore(end);
}

function isLive() {
  return isLiveMorning() || isLiveEvening();
}

function isMorningResultRender() {
  const now = dayjs();
  const start = now.hour(12).minute(1).second(0);
  const end = now.hour(16).minute(30).second(0);
  return now.isAfter(start) && now.isBefore(end);
}

function isEveningResultRender() {
  const now = dayjs();
  const start = now.hour(16).minute(30).second(0);
  const end = now.hour(23).minute(59).second(59);
  return now.isAfter(start) && now.isBefore(end);
}

function isMidNightRender() {
  const now = dayjs();
  const start = now.hour(0).minute(0).second(0);
  const end = now.hour(9).minute(0).second(0);
  return now.isAfter(start) && now.isBefore(end);
}

const timeHTML = () => {
  const date = dayjs().format('YYYY-MM-DD');
  const time = dayjs().format('hh:mm:ss A');

  if (isLive()) {
    
    return `<img src="icons/light-live.svg" /> Updating at ${date} ${time}`;
  }

  if (isMorningResultRender()) {
   
    return `<img src="icons/green-tick.svg" /> Updated at ${date} 12:01:01 PM`;
  }

  if (isEveningResultRender()) {
  
    return `<img src="icons/green-tick.svg" /> Updated at ${date} 4:30:01 PM`;
  }

  if (isMidNightRender()) {
  
    return `Loading ...`;
  }

  return ""; // fallback
};




// Update live status, start/stop render interval accordingly
async function checkIsLiveActive() {
  const liveNow =  (!await isWeekendAndIsHoliday() && isLive());
  if (liveNow && !isLiveActive) {
    isLiveActive = true;
    startRenderInterval();
    startRenderIntervalForChild();
    startRenderIntervalForTime();
  } else if (!liveNow && isLiveActive) {
    isLiveActive = false;
    stopRenderInterval();
    clearMainNumber();
    clearTime();
    clearResult();
  }
  
}


function initRender(){
  clearTime();
  clearMainNumber();
  clearResult(); 
}
window.addEventListener('DOMContentLoaded', () => {
  initRender();
});


async function clearResult() {
  const data = await getFullResult();

  // Safe destructuring with fallback to empty object
  const morning = data.result[1] || {};
  const evening = data.result[3] || {};

  if (isMidNightRender()) {
    morningSetEl.innerHTML = '--';
    morningValueEl.innerHTML = '--';
    morningTwodEl.innerHTML = '--';

    eveningSetEl.innerHTML = '--';
    eveningValueEl.innerHTML = '--';
    eveningTwodEl.innerHTML = '--';
  }
  

  if (isMorningResultRender()) {
    morningSetEl.innerHTML = morning.set ?? '--';
    morningValueEl.innerHTML = morning.value ?? '--';
    morningTwodEl.innerHTML = morning.twod ?? '--';

    eveningSetEl.innerHTML = '--';
    eveningValueEl.innerHTML = '--';
    eveningTwodEl.innerHTML = '--';
  }

  if (isEveningResultRender()) {
    morningSetEl.innerHTML = morning.set ?? '--';
    morningValueEl.innerHTML = morning.value ?? '--';
    morningTwodEl.innerHTML = morning.twod ?? '--';

    eveningSetEl.innerHTML = evening.set ?? '--';
    eveningValueEl.innerHTML = evening.value ?? '--';
    eveningTwodEl.innerHTML = evening.twod ?? '--';
  }
}


function clearTime(){
    document.querySelector('.updated-time-container').innerHTML = timeHTML();
}

// Clear the displayed number (optional UI feedback)
function clearMainNumber() {
  if(isMidNightRender()){
    mainNumberElement.innerHTML = "--";
    return;
  }
  clearRenderMainNumber();
}

async function getFullResult() {
  try {
    const response = await fetch(window.LIVE_API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Fetch live number from API
async function fetchMainNumber() {
  try {
    const response = await fetch(window.LIVE_API_URL);
    const data = await response.json();
    return data.live.twod;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "--";
  }
}

// Render live number with animation
let currentNumber = "";

async function getLatestNumberTwod(){
  const data = await getFullResult();

  const liveNum = await fetchMainNumber();
  const morning = data.result[1];
  const evening = data.result[3];
  
  if(isLiveActive){
    return liveNum;
  } else {
    if (morning.twod!=="--" && evening.twod==="--") {
        return morning.twod;
      } else if (morning.twod!=="--" && evening.twod!=="--") {
        return evening.twod;
      } else {
        return "--";
    }
  }
  
}

async function clearRenderMainNumber(){

  document.querySelector('.updated-time-container').innerHTML = timeHTML();
  if (!mainNumberElement) return;

  const newNumber = await getLatestNumberTwod();
  if (!newNumber || newNumber.length < 2) return;

  mainNumberElement.innerHTML = ""; // Clear previous digits

  for (let i = 0; i < 2; i++) {
    const digitSpan = document.createElement("span");
    digitSpan.textContent = newNumber[i];
    digitSpan.classList.add("digit");

    // Add slide-in animation if digit changed
    if (newNumber[i] !== currentNumber[i]) {
      digitSpan.classList.add("slide-in");
    }

    mainNumberElement.appendChild(digitSpan);
  }
  
}


async function renderMainNumber() {
  document.querySelector('.updated-time-container').innerHTML = timeHTML();
  if (!mainNumberElement) return;

  const newNumber = await fetchMainNumber();
  if (!newNumber || newNumber.length < 2) return;

  mainNumberElement.innerHTML = ""; // Clear previous digits

  for (let i = 0; i < 2; i++) {
    const digitSpan = document.createElement("span");
    digitSpan.textContent = newNumber[i];
    digitSpan.classList.add("digit");

    // Add slide-in animation if digit changed
    if (newNumber[i] !== currentNumber[i]) {
      digitSpan.classList.add("slide-in");
    }

    mainNumberElement.appendChild(digitSpan);
  }

  currentNumber = newNumber;
}

async function liveRenderChild(){
  const data = await getFullResult();

  // Safe destructuring with fallback to empty object
  const live = data.live || {};
  const morning = data.result[1] || {};
  
  if (isLiveActive && isLiveMorning()) {
    eveningSetEl.innerHTML = '--';
    eveningValueEl.innerHTML = '--';
    eveningTwodEl.innerHTML = '--';

    morningSetEl.innerHTML = live.set ;
    morningValueEl.innerHTML = live.value ;
    morningTwodEl.innerHTML = live.twod ;
  }
  if (isLiveActive && isLiveEvening()) {
    morningSetEl.innerHTML = morning.set ?? '--';
    morningValueEl.innerHTML = morning.value ?? '--';
    morningTwodEl.innerHTML = morning.twod ?? '--';
    
    eveningSetEl.innerHTML = live.set ;
    eveningValueEl.innerHTML = live.value ;
    eveningTwodEl.innerHTML = live.twod ;
  }
  
}

async function renderTime() {
   document.querySelector('.updated-time-container').innerHTML = timeHTML();
}


// Control intervals for rendering
function startRenderInterval() {
  if (intervalId) return; // Prevent multiple intervals
  renderMainNumber(); // Initial render immediately
  intervalId = setInterval(renderMainNumber, 2000);
}

function startRenderIntervalForChild() {
  if (childRenderIntervalId) return; // Prevent multiple intervals
  liveRenderChild(); // Initial render immediately
  childRenderIntervalId = setInterval(liveRenderChild, 2000);
}

function startRenderIntervalForTime() {
  if (timeRenderIntervalId) return; // Prevent multiple intervals
  renderTime();
  timeRenderIntervalId = setInterval(renderTime, 1000);
}

function stopRenderInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (childRenderIntervalId) {
    clearInterval(childRenderIntervalId);
    childRenderIntervalId = null;
  }
}

// Start a separate interval to monitor live status every 2 second
setInterval(checkIsLiveActive, 1000);

// Initial check on load
checkIsLiveActive();

