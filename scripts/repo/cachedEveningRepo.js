export let mainCachedEvening = JSON.parse(localStorage.getItem('cached-evening')) || 
{
  set: "--",
  value: "--",
  twod: "--",
  time: "--"
};

async function fetchAndStoreJSONEvening(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
  
      let newSet = data.live.set;
      let newValue = data.live.value;
      let newDigit = data.live.twod;
      let dateTime = data.live.time;
  
      mainCachedEvening.set = newSet;
      mainCachedEvening.value = newValue;
      mainCachedEvening.twod = newDigit;
      mainCachedEvening.time = dateTime;

      localStorage.setItem('cached-evening', JSON.stringify(mainCachedEvening));

      console.log("Data stored in local storage:", data);
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

// Function to calculate the time delay until 16:30 PM
function getTimeUntilTriggerEvening() {
  const now = new Date();
  const target = new Date();

  target.setHours(16, 30, 1, 0); // Set target time to 16:30 PM

  if (now > target) {
      // If the time has already passed, set it for tomorrow
      target.setDate(target.getDate() + 1);
  }

  return target - now; // Returns milliseconds until 12:01 PM
}


setTimeout(() => {
  fetchAndStoreJSONEvening(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Replace with your URL

  setInterval(() => {
    fetchAndStoreJSONEvening(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Runs daily at 12:01 PM
  }, 24 * 60 * 60 * 1000); 
}, getTimeUntilTriggerEvening());
