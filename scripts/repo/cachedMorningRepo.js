export let mainCachedMorning = JSON.parse(localStorage.getItem('cached-morning')) || 
{
  set: "--",
  value: "--",
  twod: "--",
  time: "--"
};

async function fetchAndStoreJSONMorning(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
  
      let newSet = data.live.set;
      let newValue = data.live.value;
      let newDigit = data.live.twod;
      let dateTime = data.live.time;
  
      mainCachedMorning.set = newSet;
      mainCachedMorning.value = newValue;
      mainCachedMorning.twod = newDigit;
      mainCachedMorning.time = dateTime;

      localStorage.setItem('cached-morning', JSON.stringify(mainCachedMorning));

      console.log("Data stored in local storage:", data);
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

// Function to calculate the time delay until 12:01 PM
function getTimeUntilTriggerMorning() {
  const now = new Date();
  const target = new Date();

  target.setHours(12, 1, 1, 0); // Set target time to 12:01 PM

  if (now > target) {
      // If the time has already passed, set it for tomorrow
      target.setDate(target.getDate() + 1);
  }

  return target - now; // Returns milliseconds until 12:01 PM
}


setTimeout(() => {
  fetchAndStoreJSONMorning(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Replace with your URL

  setInterval(() => {
    fetchAndStoreJSONMorning(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Runs daily at 12:01 PM
  }, 24 * 60 * 60 * 1000); 
}, getTimeUntilTriggerMorning());
